import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return demo address data
    const demoAddresses = [
      {
        id: '1',
        type: 'PICKUP',
        name: 'Demo Office',
        addressLine1: '123 Business Park',
        addressLine2: 'Tech Hub Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        phone: '+91 9876543210',
        email: 'demo@smartship.com',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'DELIVERY',
        name: 'Demo Warehouse',
        addressLine1: '456 Industrial Estate',
        addressLine2: 'Logistics Zone',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        phone: '+91 9876543211',
        email: 'warehouse@smartship.com',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({ addresses: demoAddresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For demo purposes, just return the submitted data with an ID
    const newAddress = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ 
      message: 'Address created successfully',
      address: newAddress 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
