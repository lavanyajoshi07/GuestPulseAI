import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getLoggedActions, createLoggedAction } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  ValidationError,
  DatabaseError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';

export const runtime = 'nodejs';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!request.homestayId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Onboarding required. Please setup your homestay first.',
        code: 'ONBOARDING_REQUIRED',
      },
      { status: 403 }
    );
  }

  const homestayId = request.homestayId;

  try {
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    try {
      const actions = await getLoggedActions(homestayId);
      return NextResponse.json({
        success: true,
        data: actions,
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch logged actions');
    }
  } catch (error) {
    logError(error, 'Actions API GET');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  if (!request.homestayId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Onboarding required. Please setup your homestay first.',
        code: 'ONBOARDING_REQUIRED',
      },
      { status: 403 }
    );
  }

  const homestayId = request.homestayId;

  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError('Invalid JSON request body');
    }

    if (!body.title || !body.category) {
      throw new ValidationError('Action title and category are required.');
    }

    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    try {
      const created = await createLoggedAction(homestayId, {
        title: body.title,
        category: body.category,
        notes: body.notes,
      });
      return NextResponse.json({
        success: true,
        data: created,
      });
    } catch (error) {
      throw new DatabaseError('Failed to log action');
    }
  } catch (error) {
    logError(error, 'Actions API POST');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});
