import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
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

    const { email, password, passwordConfirm, name } = body;

    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required', 'email');
    }

    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required', 'password');
    }

    if (!passwordConfirm || passwordConfirm !== password) {
      throw new ValidationError('Passwords do not match', 'passwordConfirm');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters', 'password');
    }

    if (!name || typeof name !== 'string') {
      throw new ValidationError('Name is required', 'name');
    }

    // Email validation regex
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email', 'email');
    }

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ValidationError('Email already registered', 'email');
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to check email availability');
    }

    // Create user
    try {
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
        data: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        message: 'Registration successful',
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to create user');
    }
  } catch (error) {
    logError(error, 'Register API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
}
