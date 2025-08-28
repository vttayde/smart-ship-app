import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return demo user data since session handling needs NextAuth setup
    const demoUser = {
      id: '1',
      email: 'demo@smartship.com',
      firstName: 'Demo',
      lastName: 'User',
      phone: '+91 9876543210',
      company: 'Smart Ship Demo',
      gstin: 'DEMO1234567890',
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ user: demoUser });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    // For demo purposes, just return the updated data
    const updatedUser = {
      id: '1',
      email: 'demo@smartship.com',
      firstName: firstName || 'Demo',
      lastName: lastName || 'User',
      phone: phone || '+91 9876543210',
      company: 'Smart Ship Demo',
      gstin: 'DEMO1234567890',
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
