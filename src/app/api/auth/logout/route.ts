import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('[Logout API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_ERROR',
      },
      { status: 500 }
    );
  }
}
