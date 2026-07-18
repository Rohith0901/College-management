import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let complaints;
    if (user.role === 'admin') {
      complaints = await Complaint.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    } else {
      complaints = await Complaint.find({ userId: user._id }).sort({ createdAt: -1 });
    }
    return NextResponse.json({ complaints });
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
    const complaint = await Complaint.create({ ...body, userId: user._id });
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { id, status, adminResponse } = body;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, adminResponse },
      { new: true }
    );
    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    return NextResponse.json({ complaint });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
