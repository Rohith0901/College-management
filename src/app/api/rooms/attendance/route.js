import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { studentId, roomId, date, present } = body;

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, roomId, date: new Date(date) },
      { present, markedBy: user._id },
      { new: true, upsert: true }
    );

    return NextResponse.json({ attendance });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const date = searchParams.get('date');

    const query = {};
    if (roomId) query.roomId = roomId;
    if (date) query.date = new Date(date);

    const attendance = await Attendance.find(query).populate('studentId', 'name studentId');
    return NextResponse.json({ attendance });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
