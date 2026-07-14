import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Homestay from '@/models/Homestay';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import { validateLoginRequest } from '@/lib/validation';
import {
  ValidationError,
  DatabaseError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitError = rateLimitMiddleware(RATE_LIMIT_CONFIGS.auth)(request);
  if (rateLimitError) return rateLimitError;
  try {
    // Parse request
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const { email, password } = validateLoginRequest(body);

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Find user
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Account not found. Please register first.',
          code: 'ACCOUNT_NOT_FOUND'
        }, { status: 404 });
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to query user');
    }

    // Compare passwords
    try {
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS'
        }, { status: 401 });
      }
    } catch (error) {
      throw new DatabaseError('Failed to validate password');
    }

    // Generate token
    const token = await generateToken(user._id.toString(), user.email);

    // Set auth cookie
    await setAuthCookie(token);

    // Check if user has homestay
    const homestay = await Homestay.findOne({ ownerId: user._id });

    // Return response
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        hasHomestay: !!homestay,
      },
      message: 'Login successful',
    });
  } catch (error) {
    logError(error, 'Login API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
}
