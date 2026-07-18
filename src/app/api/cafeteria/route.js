import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Cafeteria from '@/models/Cafeteria';

export async function GET() {
  try {
    await dbConnect();
    const cafeterias = await Cafeteria.find({});
    return NextResponse.json({ cafeterias });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const cafeteria = await Cafeteria.create(body);
    return NextResponse.json({ cafeteria }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
