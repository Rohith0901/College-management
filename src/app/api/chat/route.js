import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import Cafeteria from '@/models/Cafeteria';
import Parking from '@/models/Parking';
import Exam from '@/models/Exam';
import Doctor from '@/models/Doctor';
import Turf from '@/models/Turf';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import Complaint from '@/models/Complaint';
import Timetable from '@/models/Timetable';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function getUserFromToken(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  await dbConnect();
  return await User.findById(decoded.userId).select('-password');
}

const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_cafeterias',
        description: 'List all cafeterias with their info, location, operating hours, and seat availability.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'get_cafeteria_menu',
        description: 'Get the full menu for a specific cafeteria or all cafeterias.',
        parameters: {
          type: 'OBJECT',
          properties: {
            cafeteriaName: { type: 'STRING', description: 'Name of the cafeteria (optional, gets all if omitted)' },
          },
        },
      },
      {
        name: 'get_turfs',
        description: 'List all available turfs/sports grounds with slot availability and pricing.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'book_turf',
        description: 'Book a turf slot for the user. Requires turf name, date, and time slot.',
        parameters: {
          type: 'OBJECT',
          properties: {
            turfName: { type: 'STRING', description: 'Name of the turf to book' },
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
            timeSlot: { type: 'STRING', description: 'Time slot like "6:00-7:00", "8:00-9:00", "16:00-17:00" etc.' },
          },
          required: ['turfName', 'date', 'timeSlot'],
        },
      },
      {
        name: 'book_cafeteria',
        description: 'Book a cafeteria table for the user. Requires cafeteria name, date, time slot, and optional seats.',
        parameters: {
          type: 'OBJECT',
          properties: {
            cafeteriaName: { type: 'STRING', description: 'Name of the cafeteria' },
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
            timeSlot: { type: 'STRING', description: 'Time slot like "8:00-9:00", "12:00-1:00" etc.' },
            seats: { type: 'NUMBER', description: 'Number of seats (default 1)' },
            orderItems: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Food items to order (optional)',
            },
          },
          required: ['cafeteriaName', 'date', 'timeSlot'],
        },
      },
      {
        name: 'get_my_bookings',
        description: 'Get all active bookings for the logged-in user.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'cancel_booking',
        description: 'Cancel a user booking by its ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            bookingId: { type: 'STRING', description: 'The MongoDB ObjectId of the booking to cancel' },
          },
          required: ['bookingId'],
        },
      },
      {
        name: 'get_exams',
        description: 'Get exam schedules. Can filter for upcoming only.',
        parameters: {
          type: 'OBJECT',
          properties: {
            upcomingOnly: { type: 'BOOLEAN', description: 'If true, only return future exams' },
          },
        },
      },
      {
        name: 'get_doctors',
        description: 'List all doctors and their availability at the college hospital.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'get_parking',
        description: 'Get parking availability for bikes and cars.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'get_timetable',
        description: 'Get class timetable. Optionally filter by department, year, semester.',
        parameters: {
          type: 'OBJECT',
          properties: {
            department: { type: 'STRING', description: 'Department name' },
            year: { type: 'NUMBER', description: 'Year (1-4)' },
            semester: { type: 'NUMBER', description: 'Semester (1-8)' },
          },
        },
      },
      {
        name: 'submit_complaint',
        description: 'Submit a complaint on behalf of the user.',
        parameters: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', description: 'Complaint type: bullying, maintenance, harassment, ragging, infrastructure, other' },
            title: { type: 'STRING', description: 'Short title of the complaint' },
            description: { type: 'STRING', description: 'Detailed description of the issue' },
            isAnonymous: { type: 'BOOLEAN', description: 'Whether to submit anonymously' },
          },
          required: ['type', 'title', 'description'],
        },
      },
      {
        name: 'get_rooms',
        description: 'Get room allocation information.',
        parameters: { type: 'OBJECT', properties: {} },
      },
    ],
  },
];

async function executeTool(name, args, userId) {
  await dbConnect();

  switch (name) {
    case 'get_cafeterias': {
      const cafeterias = await Cafeteria.find({});
      if (cafeterias.length === 0) return { result: 'No cafeterias found.' };
      return {
        result: cafeterias.map(c => ({
          name: c.name, location: c.location, seats: c.totalSlots,
          hours: c.operatingHours, menuItems: c.menu?.filter(m => m.available).map(m => `${m.item} (Rs.${m.price})`) || [],
        })),
      };
    }

    case 'get_cafeteria_menu': {
      const query = args.cafeteriaName ? { name: new RegExp(args.cafeteriaName, 'i') } : {};
      const cafeterias = await Cafeteria.find(query);
      if (cafeterias.length === 0) return { result: 'No cafeterias found.' };
      return {
        result: cafeterias.map(c => ({
          cafeteria: c.name,
          menu: c.menu?.filter(m => m.available).map(m => ({ item: m.item, price: m.price, category: m.category })) || [],
        })),
      };
    }

    case 'get_turfs': {
      const turfs = await Turf.find({});
      if (turfs.length === 0) return { result: 'No turfs available.' };
      return {
        result: turfs.map(t => ({
          name: t.name, sport: t.sport, location: t.location,
          totalSlots: t.totalSlots,
          availableSlots: t.slots?.filter(s => !s.isBooked).length || t.totalSlots,
          pricePerSlot: t.pricePerSlot,
          bookedSlots: t.slots?.filter(s => s.isBooked).map(s => ({ time: s.time, date: s.date?.toISOString()?.split('T')[0] })) || [],
        })),
      };
    }

    case 'book_turf': {
      if (!userId) return { result: 'Authentication required. User must be logged in.' };
      const turf = await Turf.findOne({ name: new RegExp(args.turfName, 'i') });
      if (!turf) return { result: `No turf found with name "${args.turfName}". Available turfs can be found using get_turfs.` };

      const dateStr = args.date;
      const existing = await Booking.findOne({
        userId, type: 'turf', resourceId: turf._id,
        date: new Date(dateStr), timeSlot: args.timeSlot, status: { $ne: 'cancelled' },
      });
      if (existing) return { result: 'You already have a booking for this slot.' };

      const booking = await Booking.create({
        userId, type: 'turf', resourceId: turf._id, resourceName: turf.name,
        date: new Date(dateStr), timeSlot: args.timeSlot, status: 'confirmed',
      });

      const slot = turf.slots.find(s => s.time === args.timeSlot && s.date?.toDateString() === new Date(dateStr).toDateString());
      if (slot) { slot.isBooked = true; slot.bookedBy = userId; }
      else { turf.slots.push({ time: args.timeSlot, isBooked: true, bookedBy: userId, date: new Date(dateStr) }); }
      await turf.save();

      return { result: { success: true, bookingId: booking._id, turf: turf.name, date: dateStr, timeSlot: args.timeSlot, message: 'Turf booked successfully!' } };
    }

    case 'book_cafeteria': {
      if (!userId) return { result: 'Authentication required. User must be logged in.' };
      const cafe = await Cafeteria.findOne({ name: new RegExp(args.cafeteriaName, 'i') });
      if (!cafe) return { result: `No cafeteria found with name "${args.cafeteriaName}".` };

      const existing = await Booking.findOne({
        userId, type: 'cafeteria', resourceId: cafe._id,
        date: new Date(args.date), timeSlot: args.timeSlot, status: { $ne: 'cancelled' },
      });
      if (existing) return { result: 'You already have a booking for this cafeteria at this time.' };

      const booking = await Booking.create({
        userId, type: 'cafeteria', resourceId: cafe._id, resourceName: cafe.name,
        date: new Date(args.date), timeSlot: args.timeSlot,
        details: { seats: args.seats || 1, orderItems: args.orderItems || [] },
        status: 'confirmed',
      });

      return { result: { success: true, bookingId: booking._id, cafeteria: cafe.name, date: args.date, timeSlot: args.timeSlot, seats: args.seats || 1, orderItems: args.orderItems || [], message: 'Cafeteria table booked successfully!' } };
    }

    case 'get_my_bookings': {
      if (!userId) return { result: 'Authentication required. User must be logged in.' };
      const bookings = await Booking.find({ userId, status: { $ne: 'cancelled' } }).sort({ date: -1 });
      if (bookings.length === 0) return { result: 'You have no active bookings.' };
      return {
        result: bookings.map(b => ({
          id: b._id, type: b.type, resource: b.resourceName,
          date: b.date?.toISOString()?.split('T')[0], timeSlot: b.timeSlot,
          status: b.status, details: b.details,
        })),
      };
    }

    case 'cancel_booking': {
      if (!userId) return { result: 'Authentication required. User must be logged in.' };
      const booking = await Booking.findOne({ _id: args.bookingId, userId });
      if (!booking) return { result: 'Booking not found or does not belong to you.' };
      booking.status = 'cancelled';
      await booking.save();
      return { result: { success: true, message: `Booking for ${booking.resourceName} has been cancelled.` } };
    }

    case 'get_exams': {
      const query = args.upcomingOnly ? { date: { $gte: new Date() } } : {};
      const exams = await Exam.find(query).sort({ date: 1 });
      if (exams.length === 0) return { result: 'No exams scheduled.' };
      return {
        result: exams.map(e => ({
          subject: e.subject, code: e.code, date: e.date?.toISOString()?.split('T')[0],
          time: e.time, duration: e.duration, room: e.room,
          department: e.department, year: e.year, type: e.type,
        })),
      };
    }

    case 'get_doctors': {
      const doctors = await Doctor.find({});
      if (doctors.length === 0) return { result: 'No doctors information available.' };
      return {
        result: doctors.map(d => ({
          name: d.name, specialization: d.specialization,
          available: d.available, room: d.room,
          schedule: d.schedule?.map(s => ({ day: s.day, hours: `${s.startTime}-${s.endTime}` })) || [],
        })),
      };
    }

    case 'get_parking': {
      const parking = await Parking.find({});
      if (parking.length === 0) return { result: 'No parking areas configured.' };
      return {
        result: parking.map(p => ({
          type: p.type, location: p.location, total: p.totalSpots,
          available: p.availableSpots, pricePerHour: p.pricePerHour,
        })),
      };
    }

    case 'get_timetable': {
      const query = {};
      if (args.department) query.department = args.department;
      if (args.year) query.year = args.year;
      if (args.semester) query.semester = args.semester;
      const timetables = await Timetable.find(query);
      if (timetables.length === 0) return { result: 'No timetable found for these filters.' };
      return {
        result: timetables.map(t => ({
          department: t.department, year: t.year, semester: t.semester,
          schedule: t.schedule?.map(s => ({
            day: s.day, periods: s.periods?.map(p => ({
              subject: p.subject, time: p.time, room: p.room, faculty: p.faculty,
            })) || [],
          })) || [],
        })),
      };
    }

    case 'submit_complaint': {
      if (!userId) return { result: 'Authentication required. User must be logged in.' };
      const validTypes = ['bullying', 'maintenance', 'harassment', 'ragging', 'infrastructure', 'other'];
      const complaintType = validTypes.includes(args.type) ? args.type : 'other';
      const complaint = await Complaint.create({
        userId, type: complaintType, title: args.title,
        description: args.description, isAnonymous: args.isAnonymous || false,
        status: 'pending', priority: 'medium',
      });
      return { result: { success: true, complaintId: complaint._id, message: 'Complaint submitted successfully. Our admin team will review it.' } };
    }

    case 'get_rooms': {
      const rooms = await Room.find({});
      if (rooms.length === 0) return { result: 'No rooms configured.' };
      return {
        result: rooms.map(r => ({
          name: r.name, building: r.building, type: r.type,
          capacity: r.capacity, allocated: r.isAllocated, allocatedTo: r.allocatedTo,
        })),
      };
    }

    default:
      return { result: 'Unknown action.' };
  }
}

const SYSTEM_PROMPT = `You are CollegeHub AI, an intelligent assistant for a college campus management system. You can help users with:

- B Cafeteria: Check menus, availability, and BOOK tables with specific dates/times
- Turf: Check sports turf availability and BOOK slots
- Parking: Check bike/car parking availability
- Exams: View schedules and upcoming exams
- Timetable: Look up class schedules
- Doctors: Check doctor availability at college hospital
- Complaints: SUBMIT complaints on behalf of users
- Rooms: Check room allocation
- Bookings: View and CANCEL existing bookings

IMPORTANT RULES:
- When booking, always confirm details with the user before executing. Ask for missing required info (date, time slot).
- For turf bookings, valid time slots are: "6:00-7:00", "7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00", "16:00-17:00", "17:00-18:00", "18:00-19:00"
- For cafeteria bookings, valid time slots are: "8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00", "3:00-4:00", "4:00-5:00", "5:00-6:00"
- If a user asks to book something, first call the relevant get_* function to check availability, then proceed with booking.
- Be concise, friendly, and helpful. Use emoji sparingly.
- If the user is not logged in and tries to book, tell them they need to log in first.
- Always use the tools/functions available to you to fetch real data. Do not make up information.
- When showing results, format them nicely with clear structure.`;

export async function POST(req) {
  try {
    const authHeader = req.headers.get?.('authorization') || req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    const { message, history = [] } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        response: 'AI chatbot is not configured yet. Please add your GEMINI_API_KEY to the .env.local file. Get a free key at https://aistudio.google.com/apikey',
        actions: [],
      });
    }

    await dbConnect();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT + (user ? `\n\nLogged-in user: ${user.name} (${user.email}, role: ${user.role})` : '\n\nNo user is currently logged in.'),
      tools,
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    let responseText = result.response.text();
    const functionCalls = result.response.functionCalls();
    const actions = [];

    if (functionCalls && functionCalls.length > 0) {
      let callResults = [];
      for (const fc of functionCalls) {
        const toolResult = await executeTool(fc.name, fc.args, user?._id);
        callResults.push({ name: fc.name, args: fc.args, result: toolResult.result });
        actions.push({ type: fc.name, args: fc.args, result: toolResult.result });
      }

      const toolResponseParts = callResults.map(cr => ({
        functionResponse: {
          name: cr.name,
          response: { result: cr.result },
        },
      }));

      const finalResult = await chat.sendMessage([{ functionResponse: toolResponseParts }]);
      responseText = finalResult.response.text();
    }

    return NextResponse.json({ response: responseText, actions });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      response: 'Sorry, I encountered an error. Please try again.',
      actions: [],
    }, { status: 500 });
  }
}
