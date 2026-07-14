import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Homestay from '@/models/Homestay';
import { auth } from '@/auth';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
  homestayId?: string;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      let userId = '';
      let userEmail = '';

      // 1. Check NextAuth Session first
      const session = await auth();
      if (session?.user) {
        userId = session.user.id || '';
        userEmail = session.user.email || '';
      }

      // 2. Fallback to custom JWT token
      if (!userId) {
        const authHeader = req.headers.get('Authorization');
        let token = extractTokenFromHeader(authHeader || '');

        if (!token) {
          token = req.cookies.get('auth_token')?.value || '';
        }

        if (token) {
          const payload = await verifyToken(token);
          if (payload) {
            userId = payload.userId;
            userEmail = payload.email;
          } else {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid or expired token',
                code: 'AUTH_INVALID',
              },
              { status: 401 }
            );
          }
        }
      }

      // 3. Reject if unauthenticated
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            code: 'AUTH_MISSING',
          },
          { status: 401 }
        );
      }

      // Attach user info to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.userId = userId;
      authenticatedReq.userEmail = userEmail;

      // Retrieve owner's homestay (for multi-tenant scoping)
      try {
        await connectDB();
        const homestay = await Homestay.findOne({ ownerId: userId }).lean();
        if (homestay) {
          authenticatedReq.homestayId = (homestay as any)._id.toString();
        }
      } catch (dbError) {
        console.error('[Auth Middleware] Database error finding homestay:', dbError);
      }

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

