import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import Homestay from '@/models/Homestay';
import { mockStore } from '@/lib/mockStore';

export const runtime = 'nodejs';

// GET current user's homestay
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const userId = req.userId;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const isMock = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME') || process.env.MONGODB_URI.includes('cluster-name');
  
  if (isMock) {
    const homestay = mockStore.getHomestayByOwnerId(userId);
    return NextResponse.json({ success: true, homestay: homestay || null });
  }

  try {
    await connectDB();
    const homestay = await Homestay.findOne({ ownerId: userId }).lean();
    return NextResponse.json({ success: true, homestay: homestay || null });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve homestay' }, { status: 500 });
  }
});

// POST create new homestay
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const userId = req.userId;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { homestayName, location, propertyType, description } = body;

    if (!homestayName || !location || !propertyType) {
      return NextResponse.json(
        { success: false, error: 'Homestay Name, Location, and Property Type are required' },
        { status: 400 }
      );
    }

    const isMock = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME') || process.env.MONGODB_URI.includes('cluster-name');

    if (isMock) {
      const existing = mockStore.getHomestayByOwnerId(userId);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Homestay already configured for this user' }, { status: 400 });
      }

      const homestay = mockStore.createHomestay(userId, homestayName, location, propertyType, description);
      return NextResponse.json({ success: true, homestay });
    }

    await connectDB();
    const existing = await Homestay.findOne({ ownerId: userId });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Homestay already configured for this user' }, { status: 400 });
    }

    const homestay = new Homestay({
      ownerId: userId,
      homestayName,
      location,
      propertyType,
      description,
    });

    await homestay.save();

    return NextResponse.json({ success: true, homestay });
  } catch (error) {
    console.error('[Homestay API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save homestay configuration' }, { status: 500 });
  }
});
