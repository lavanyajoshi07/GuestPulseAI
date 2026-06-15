import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getDashboardStats } from '@/lib/db';
import {
  DatabaseError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Get dashboard statistics
    try {
      const stats = await getDashboardStats();

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
}
