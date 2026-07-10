import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getExperienceForecast } from '@/lib/db';
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
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    try {
      const forecastData = await getExperienceForecast(homestayId, forceRefresh);
      return NextResponse.json({
        success: true,
        data: forecastData,
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch guest experience forecasting data');
    }
  } catch (error) {
    logError(error, 'Forecasting API GET');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});
