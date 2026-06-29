import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Homestay from '@/models/Homestay';
import { mockStore } from '@/lib/mockStore';

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
      // Get token from header
      const authHeader = req.headers.get('Authorization');
      let token = extractTokenFromHeader(authHeader || '');

      // Fallback to cookie if no header
      if (!token) {
        token = req.cookies.get('auth_token')?.value || '';
      }

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

      // Retrieve owner's homestay (for multi-tenant scoping)
      const isMock = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME') || process.env.MONGODB_URI.includes('cluster-name');
      if (isMock) {
        // Access mock store dynamically to see if user has a homestay
        const mockStoreAny = mockStore as any;
        const homestays = mockStoreAny.getHomestays ? mockStoreAny.getHomestays() : [];
        const homestay = homestays.find((h: any) => h.ownerId === payload.userId);
        if (homestay) {
          authenticatedReq.homestayId = homestay._id;
        }
      } else {
        try {
          await connectDB();
          const homestay = await Homestay.findOne({ ownerId: payload.userId }).lean();
          if (homestay) {
            authenticatedReq.homestayId = (homestay as any)._id.toString();
          }
        } catch (dbError) {
          console.error('[Auth Middleware] Database error finding homestay:', dbError);
        }
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

