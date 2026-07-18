import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Parking from '@/models/Parking';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const parking = await Parking.find({});
    return NextResponse.json({ parking });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { parkingId, vehicleNumber, date, timeSlot } = body;

    if (!parkingId || !vehicleNumber || !date || !timeSlot) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const parking = await Parking.findById(parkingId);
    if (!parking) return NextResponse.json({ error: 'Parking not found' }, { status: 404 });
    if (parking.availableSpots <= 0) return NextResponse.json({ error: 'No spots available' }, { status: 400 });

    const existingBooking = await Booking.findOne({
      userId: user._id,
      type: 'parking',
      resourceId: parkingId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'You already have a booking for this slot' }, { status: 400 });
    }

    const booking = await Booking.create({
      userId: user._id,
      type: 'parking',
      resourceId: parkingId,
      resourceName: `${parking.type} parking at ${parking.location}`,
      date: new Date(date),
      timeSlot,
      details: { vehicleNumber, parkingType: parking.type, location: parking.location },
      status: 'confirmed',
    });

    parking.availableSpots -= 1;
    await parking.save();

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { bookingId } = body;

    const booking = await Booking.findOne({ _id: bookingId, userId: user._id, type: 'parking', status: 'confirmed' });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    booking.status = 'cancelled';
    await booking.save();

    const parking = await Parking.findById(booking.resourceId);
    if (parking && parking.availableSpots < parking.totalSpots) {
      parking.availableSpots += 1;
      await parking.save();
    }

    return NextResponse.json({ message: 'Booking released' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
