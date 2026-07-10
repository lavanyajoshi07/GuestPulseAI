import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getReportAnalytics } from '@/lib/db';
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
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || 'all';
  const year = searchParams.get('year') || 'all';
  const range = searchParams.get('range') || 'all';
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    try {
      const reportData = await getReportAnalytics(homestayId, month, year, range, forceRefresh);
      return NextResponse.json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      throw new DatabaseError('Failed to generate report analytics');
    }
  } catch (error) {
    logError(error, 'Reports API');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});
