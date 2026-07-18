import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Turf from '@/models/Turf';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const turfs = await Turf.find({});
    return NextResponse.json({ turfs });
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
    const { turfId, turfName, date, timeSlot } = body;

    const turf = await Turf.findById(turfId);
    if (!turf) return NextResponse.json({ error: 'Turf not found' }, { status: 404 });

    const slot = turf.slots.find(s => s.time === timeSlot && s.date?.toDateString() === new Date(date).toDateString());
    if (slot && slot.isBooked) {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 400 });
    }

    const booking = await Booking.create({
      userId: user._id,
      type: 'turf',
      resourceId: turfId,
      resourceName: turfName,
      date: new Date(date),
      timeSlot,
      status: 'confirmed',
    });

    if (slot) {
      slot.isBooked = true;
      slot.bookedBy = user._id;
    } else {
      turf.slots.push({ time: timeSlot, isBooked: true, bookedBy: user._id, date: new Date(date) });
    }
    await turf.save();

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
