import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const bookings = await Booking.find({ userId: user._id, type: 'cafeteria' }).sort({ date: -1 });
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { cafeteriaId, cafeteriaName, date, timeSlot, seats, orderItems } = body;

    const existingBooking = await Booking.findOne({
      userId: user._id,
      type: 'cafeteria',
      resourceId: cafeteriaId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'You already have a booking for this slot' }, { status: 400 });
    }

    const booking = await Booking.create({
      userId: user._id,
      type: 'cafeteria',
      resourceId: cafeteriaId,
      resourceName: cafeteriaName,
      date: new Date(date),
      timeSlot,
      details: { seats, orderItems },
      status: 'confirmed',
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
