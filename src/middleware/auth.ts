import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get token from header
      const authHeader = req.headers.get('Authorization');
      const token = extractTokenFromHeader(authHeader || '');

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            code: 'AUTH_MISSING',
          },
          { status: 401 }
        );
      }

      // Verify token
      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired token',
            code: 'AUTH_INVALID',
          },
          { status: 401 }
        );
      }

      // Attach user info to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.userId = payload.userId;
      authenticatedReq.userEmail = payload.email;

      // Call handler
      return await handler(authenticatedReq);
    } catch (error) {
      console.error('[Auth Middleware] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      );
    }
  };
}
