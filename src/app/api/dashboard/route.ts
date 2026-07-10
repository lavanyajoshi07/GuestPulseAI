import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getDashboardStats } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
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
    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Get dashboard statistics scoped by homestayId
    try {
      const stats = await getDashboardStats(homestayId);

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch dashboard statistics');
    }
  } catch (error) {
    logError(error, 'Dashboard API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});

