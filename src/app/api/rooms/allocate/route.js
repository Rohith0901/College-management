import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { roomId, allocatedTo, allocatedDepartment } = body;

    const room = await Room.findByIdAndUpdate(
      roomId,
      { isAllocated: true, allocatedTo, allocatedDepartment },
      { new: true }
    );

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
