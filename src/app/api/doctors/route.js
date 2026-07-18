import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    await dbConnect();
    const doctors = await Doctor.find({});
    return NextResponse.json({ doctors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const doctor = await Doctor.create(body);
    return NextResponse.json({ doctor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
