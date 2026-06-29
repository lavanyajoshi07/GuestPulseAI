import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getBenchmarkingData } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { mockStore } from '@/lib/mockStore';
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
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    let dbConn;
    try {
      dbConn = await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    if (dbConn === null) {
      const benchmarkData = mockStore.getBenchmarking(homestayId);
      return NextResponse.json({
        success: true,
        data: benchmarkData,
      });
    }

    try {
      const benchmarkData = await getBenchmarkingData(homestayId, forceRefresh);
      return NextResponse.json({
        success: true,
        data: benchmarkData,
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch benchmarking data');
    }
  } catch (error) {
    logError(error, 'Benchmarking API');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});
