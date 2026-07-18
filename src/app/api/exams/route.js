import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    const query = {};
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const exams = await Exam.find(query).sort({ date: 1 });
    return NextResponse.json({ exams });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const exam = await Exam.create(body);
    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
