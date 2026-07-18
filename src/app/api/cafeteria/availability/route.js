import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const cafeteriaId = searchParams.get('cafeteriaId');
    const date = searchParams.get('date');

    const query = { type: 'cafeteria', status: { $ne: 'cancelled' } };
    if (cafeteriaId) query.resourceId = cafeteriaId;
    if (date) query.date = new Date(date);

    const bookings = await Booking.find(query);

    const timeSlots = ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00', '6:00-7:00', '7:00-8:00'];
    const availability = timeSlots.map(slot => {
      const bookedCount = bookings.filter(b => b.timeSlot === slot).length;
      return { timeSlot: slot, booked: bookedCount, available: 20 - bookedCount };
    });

    return NextResponse.json({ availability });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
