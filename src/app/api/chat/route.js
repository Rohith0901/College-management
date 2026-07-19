import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Cafeteria from '@/models/Cafeteria';
import Parking from '@/models/Parking';
import Exam from '@/models/Exam';
import Doctor from '@/models/Doctor';
import Turf from '@/models/Turf';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import Complaint from '@/models/Complaint';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

function matchIntent(message) {
  const lower = message.toLowerCase();

  if (lower.includes('cafeteria') || lower.includes('canteen') || lower.includes('food') || lower.includes('lunch') || lower.includes('meal')) {
    if (lower.includes('book') || lower.includes('reserve') || lower.includes('slot')) return 'cafeteria_book';
    if (lower.includes('menu') || lower.includes('food') || lower.includes('item')) return 'cafeteria_menu';
    return 'cafeteria_availability';
  }

  if (lower.includes('park') || lower.includes('bike') || lower.includes('car') || lower.includes('vehicle')) {
    return 'parking';
  }

  if (lower.includes('exam') || lower.includes('test') || lower.includes('midterm') || lower.includes('final')) {
    if (lower.includes('next') || lower.includes('upcoming') || lower.includes('when')) return 'exam_upcoming';
    return 'exam_schedule';
  }

  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class')) {
    return 'timetable';
  }

  if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('health')) {
    return 'doctor';
  }

  if (lower.includes('turf') || lower.includes('ground') || lower.includes('sport') || lower.includes('play')) {
    return 'turf';
  }

  if (lower.includes('complaint') || lower.includes('issue') || lower.includes('problem') || lower.includes('bully') || lower.includes('rag')) {
    return 'complaint';
  }

  if (lower.includes('room') || lower.includes('hall') || lower.includes('lab')) {
    return 'room';
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'greeting';
  if (lower.includes('help') || lower.includes('what can')) return 'help';

  return 'unknown';
}

async function fetchData(intent, userId) {
  const now = new Date();

  switch (intent) {
    case 'cafeteria_availability': {
      const cafeterias = await Cafeteria.find({});
      return cafeterias.length === 0
        ? 'No cafeterias found in the system yet.'
        : 'Cafeteria data:\n' + cafeterias.map(c =>
          `${c.name} at ${c.location}, Hours: ${c.operatingHours}, Seats: ${c.totalSlots}`
        ).join('\n');
    }

    case 'cafeteria_menu': {
      const cafeterias = await Cafeteria.find({});
      if (cafeterias.length === 0) return 'No cafeteria menu available yet.';
      return 'Menu:\n' + cafeterias.map(c =>
        `${c.name}:\n${c.menu.filter(m => m.available).map(m => `  ${m.item} - Rs.${m.price} (${m.category})`).join('\n')}`
      ).join('\n\n');
    }

    case 'cafeteria_book':
      return 'To book: Go to Cafeteria section, select cafeteria, choose date/time/seats, click Book.';

    case 'parking': {
      const parking = await Parking.find({});
      return parking.length === 0
        ? 'No parking areas configured.'
        : 'Parking:\n' + parking.map(p =>
          `${p.type.toUpperCase()} at ${p.location}: ${p.availableSpots}/${p.totalSpots} available, Rs.${p.pricePerHour}/hr`
        ).join('\n');
    }

    case 'exam_upcoming': {
      const exams = await Exam.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5);
      return exams.length === 0
        ? 'No upcoming exams.'
        : 'Upcoming exams:\n' + exams.map(e => {
          const days = Math.ceil((new Date(e.date) - now) / 86400000);
          return `${e.subject} (${e.code || 'N/A'}) on ${new Date(e.date).toLocaleDateString()} at ${e.time}, Room ${e.room}, ${days} days left`;
        }).join('\n');
    }

    case 'exam_schedule': {
      const exams = await Exam.find({}).sort({ date: 1 });
      return exams.length === 0
        ? 'No exams scheduled.'
        : 'Full schedule:\n' + exams.map(e =>
          `${e.subject} - ${new Date(e.date).toLocaleDateString()} at ${e.time} (${e.type}), Room ${e.room}, Dept ${e.department} Year ${e.year}`
        ).join('\n');
    }

    case 'timetable':
      return 'Go to Timetable section, select department/year/semester to view schedule.';

    case 'doctor': {
      const doctors = await Doctor.find({});
      return doctors.length === 0
        ? 'No doctors info available.'
        : 'Doctors:\n' + doctors.map(d =>
          `Dr. ${d.name} - ${d.specialization} - ${d.available ? 'Available' : 'Not Available'} - Room ${d.room || 'N/A'} - Schedule: ${d.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}`
        ).join('\n');
    }

    case 'turf': {
      const turfs = await Turf.find({});
      if (turfs.length === 0) return 'No turfs available.';
      return 'Turfs:\n' + turfs.map(t => {
        const avail = t.slots?.filter(s => !s.isBooked).length || t.totalSlots;
        return `${t.name} (${t.sport}) at ${t.location}: ${avail}/${t.totalSlots} slots free, Rs.${t.pricePerSlot}/slot`;
      }).join('\n');
    }

    case 'complaint':
      return 'To complain: Go to Complaints section, select type, enter title/description, submit.';

    case 'room': {
      const rooms = await Room.find({});
      return rooms.length === 0
        ? 'No rooms configured.'
        : 'Rooms:\n' + rooms.map(r =>
          `${r.name} (${r.building}) - ${r.type}, Cap ${r.capacity}, ${r.isAllocated ? `Allocated to ${r.allocatedTo}` : 'Available'}`
        ).join('\n');
    }

    case 'my_bookings': {
      if (!userId) return 'User not logged in.';
      const bookings = await Booking.find({ userId, status: { $ne: 'cancelled' } }).sort({ date: -1 });
      return bookings.length === 0
        ? 'No active bookings.'
        : 'My bookings:\n' + bookings.map(b =>
          `${b.type} - ${b.resourceName} on ${b.date?.toISOString()?.split('T')[0]} at ${b.timeSlot} (${b.status})`
        ).join('\n');
    }

    default:
      return null;
  }
}

async function callNvidiaAI(userMessage, contextData) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are CollegeHub AI, a friendly campus assistant. You help college students with cafeteria, parking, exams, doctors, turf, complaints, and room allocation. Be concise, helpful, and conversational. Format responses nicely with clear structure. Use emoji sparingly. Never make up data - only use what's provided.`;

  const userContent = contextData
    ? `User asked: "${userMessage}"\n\nHere is the relevant data from the system:\n${contextData}\n\nRespond to the user naturally using this data.`
    : userMessage;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

function getPredefinedResponse(intent) {
  switch (intent) {
    case 'greeting':
      return "Hello! I'm CollegeHub AI. I can help you with:\n- Cafeteria (availability, menu, booking)\n- Parking (bike/car spots)\n- Exams (schedule, upcoming)\n- Doctors (availability)\n- Turf (booking)\n- Complaints\n- Room allocation\n\nWhat would you like to know?";
    case 'help':
      return "Here's what I can help you with:\n\n Cafeteria - Check availability, view menu, book tables\n Parking - Check bike/car parking spots\n Exams - View schedules, upcoming exams\n Doctors - Check availability, specializations\n Turf - Book sports turf slots\n Complaints - How to raise complaints\n Rooms - Check room allocation\n\nJust ask me anything!";
    default:
      return "I'm not sure I understand. You can ask me about:\n- Cafeteria (availability, menu, booking)\n- Parking (bike/car spots)\n- Exams (schedule, upcoming)\n- Doctors (availability)\n- Turf (booking)\n- Complaints\n- Room allocation\n\nTry asking something like 'Any cafeteria slots left?' or 'When is my next exam?'";
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { message } = await req.json();
    const intent = matchIntent(message);

    const contextData = await fetchData(intent);

    if (contextData === null) {
      return NextResponse.json({ response: getPredefinedResponse(intent) });
    }

    const aiResponse = await callNvidiaAI(message, contextData);

    if (aiResponse) {
      return NextResponse.json({ response: aiResponse });
    }

    return NextResponse.json({ response: contextData || getPredefinedResponse(intent) });
  } catch (error) {
    return NextResponse.json({ response: "Sorry, I encountered an error. Please try again." }, { status: 500 });
  }
}
