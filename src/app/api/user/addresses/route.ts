import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      addresses
    })

  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      type, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      pincode, 
      isDefault 
    } = body

    // Validation
    const errors: { [key: string]: string } = {}

    if (!type || !['home', 'work', 'other'].includes(type)) {
      errors.type = 'Please select a valid address type'
    }

    if (!addressLine1?.trim()) {
      errors.addressLine1 = 'Address line 1 is required'
    }

    if (!city?.trim()) {
      errors.city = 'City is required'
    }

    if (!state?.trim()) {
      errors.state = 'State is required'
    }

    if (!pincode?.trim() || !/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit pincode'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }

    // Create new address
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        type: type.toLowerCase(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: isDefault || false,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Address created successfully',
      address
    })

  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
