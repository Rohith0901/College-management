import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, department, year, semester, studentId, phone } = body;

    if (!name || !email || !password || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      year,
      semester,
      studentId,
      phone,
      role: 'student',
    });

    const token = generateToken(user._id, user.role);

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
      token,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
