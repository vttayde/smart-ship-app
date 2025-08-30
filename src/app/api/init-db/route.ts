import { hashPassword } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check if this is the first run
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json({
        message: 'Database already initialized',
        userCount,
      });
    }

    // Hash passwords
    const demoPasswordHash = await hashPassword('demo123');
    const adminPasswordHash = await hashPassword('admin123');

    // Create demo users
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@smartship.com',
        firstName: 'Demo',
        lastName: 'User',
        passwordHash: demoPasswordHash,
        role: 'USER',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@smartship.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({
      message: 'Database initialized successfully',
      users: [
        { id: demoUser.id, email: demoUser.email, role: demoUser.role },
        { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      ],
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
