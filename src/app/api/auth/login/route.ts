import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import { mockStore } from '@/lib/mockStore';
import bcryptjs from 'bcryptjs';
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

    const { email, password } = body;

    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required', 'email');
    }

    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required', 'password');
    }

    // Connect to database
    let dbConn;
    try {
      dbConn = await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    if (dbConn === null) {
      // Mock mode fallback
      const user = mockStore.findUserByEmail(email);
      if (!user) {
        throw new ValidationError('Invalid email or password');
      }

      const isPasswordValid = bcryptjs.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ValidationError('Invalid email or password');
      }

      const token = await generateToken(user._id, user.email);
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        message: 'Login successful',
      });
    }

    // Find user
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        throw new ValidationError('Invalid email or password');
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to query user');
    }

    // Compare passwords
    try {
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new ValidationError('Invalid email or password');
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to validate password');
    }

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
