import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import { validateRegisterRequest } from '@/lib/validation';
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

    const { email, password, name } = validateRegisterRequest(body);

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Create user
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email already exists. Please continue with Login.',
          code: 'EMAIL_ALREADY_EXISTS'
        }, { status: 409 });
      }

      const user = new User({
        email: email.toLowerCase(),
        password,
        name,
      });

      await user.save();

      // Generate token
      const token = await generateToken(user._id.toString(), user.email);

      // Set auth cookie
      await setAuthCookie(token);

      // Return response
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          hasHomestay: false,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error('[Register API] User save error:', error);
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to create user');
    }
  } catch (error) {
    logError(error, 'Register API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
}
