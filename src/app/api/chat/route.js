import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Cafeteria from '@/models/Cafeteria';
import Parking from '@/models/Parking';
import Exam from '@/models/Exam';
import Doctor from '@/models/Doctor';
import Turf from '@/models/Turf';
import Room from '@/models/Room';
import Booking from '@/models/Booking';

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

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'greeting';
  }

  if (lower.includes('help') || lower.includes('what can')) {
    return 'help';
  }

  return 'unknown';
}

export async function POST(req) {
  try {
    await dbConnect();
    const { message } = await req.json();
    const intent = matchIntent(message);

    let response = '';

    switch (intent) {
      case 'greeting':
        response = "Hello! I'm CollegeHub AI assistant. I can help you with:\n- Cafeteria booking & menu\n- Parking availability\n- Exam schedules\n- Doctor availability\n- Turf booking\n- Complaints\n- Room allocation\n\nWhat would you like to know?";
        break;

      case 'help':
        response = "Here's what I can help you with:\n\n Cafeteria - Check availability, view menu, book tables\n Parking - Check bike/car parking spots\n Exams - View schedules, upcoming exams\n Doctors - Check availability, specializations\n Turf - Book sports turf slots\n Complaints - How to raise complaints\n Rooms - Check room allocation\n\nJust ask me anything!";
        break;

      case 'cafeteria_availability': {
        const cafeterias = await Cafeteria.find({});
        if (cafeterias.length === 0) {
          response = "No cafeterias found in the system yet.";
        } else {
          response = "Here are the cafeterias and their info:\n\n";
          cafeterias.forEach(c => {
            response += `${c.name} at ${c.location}\n  Hours: ${c.operatingHours}\n  Total slots: ${c.totalSlots}\n\n`;
          });
          response += "Would you like to book a table or check the menu?";
        }
        break;
      }

      case 'cafeteria_menu': {
        const cafeterias = await Cafeteria.find({});
        if (cafeterias.length === 0) {
          response = "No cafeteria menu available yet.";
        } else {
          response = "Menu from our cafeterias:\n\n";
          cafeterias.forEach(c => {
            response += `${c.name}:\n`;
            c.menu.forEach(m => {
              if (m.available) response += `  ${m.item} - Rs.${m.price} (${m.category})\n`;
            });
            response += "\n";
          });
        }
        break;
      }

      case 'cafeteria_book':
        response = "To book a cafeteria table:\n1. Go to the Cafeteria section\n2. Select your preferred cafeteria\n3. Choose date and time slot\n4. Select number of seats\n5. Place your order (optional)\n\nClick 'Book Now' to confirm!";
        break;

      case 'parking': {
        const parking = await Parking.find({});
        if (parking.length === 0) {
          response = "No parking areas configured yet.";
        } else {
          response = "Parking availability:\n\n";
          parking.forEach(p => {
            response += `${p.type.toUpperCase()} Parking at ${p.location}\n  Total: ${p.totalSpots} | Available: ${p.availableSpots}\n  Price: Rs.${p.pricePerHour}/hour\n\n`;
          });
          response += "Would you like to book a spot?";
        }
        break;
      }

      case 'exam_upcoming': {
        const now = new Date();
        const exams = await Exam.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5);
        if (exams.length === 0) {
          response = "No upcoming exams scheduled.";
        } else {
          response = "Your upcoming exams:\n\n";
          exams.forEach(e => {
            const daysLeft = Math.ceil((new Date(e.date) - now) / (1000 * 60 * 60 * 24));
            response += `${e.subject} (${e.code || 'N/A'})\n  Date: ${new Date(e.date).toLocaleDateString()} | Time: ${e.time}\n  Room: ${e.room} | Duration: ${e.duration}\n  Days left: ${daysLeft}\n\n`;
          });
        }
        break;
      }

      case 'exam_schedule': {
        const exams = await Exam.find({}).sort({ date: 1 });
        if (exams.length === 0) {
          response = "No exam schedule available yet. Ask admin to add exams.";
        } else {
          response = "Full exam schedule:\n\n";
          exams.forEach(e => {
            response += `${e.subject} - ${new Date(e.date).toLocaleDateString()} at ${e.time} (${e.type})\n  Room: ${e.room} | Dept: ${e.department} | Year: ${e.year}\n\n`;
          });
        }
        break;
      }

      case 'timetable':
        response = "To view your timetable:\n1. Go to the Timetable section\n2. Select your department and year\n3. View your weekly schedule\n\nYou can see all subjects, timings, rooms, and faculty details.";
        break;

      case 'doctor': {
        const doctors = await Doctor.find({});
        if (doctors.length === 0) {
          response = "No doctors information available yet.";
        } else {
          response = "College Hospital - Doctor Availability:\n\n";
          doctors.forEach(d => {
            const status = d.available ? "Available" : "Not Available";
            response += `Dr. ${d.name} - ${d.specialization}\n  Status: ${status}\n  Room: ${d.room || 'N/A'}\n  Schedule:\n`;
            d.schedule.forEach(s => {
              response += `    ${s.day}: ${s.startTime} - ${s.endTime}\n`;
            });
            response += "\n";
          });
          response += "Would you like to book an appointment?";
        }
        break;
      }

      case 'turf': {
        const turfs = await Turf.find({});
        if (turfs.length === 0) {
          response = "No turfs available for booking yet.";
        } else {
          response = "Available turfs:\n\n";
          turfs.forEach(t => {
            const availableSlots = t.slots.filter(s => !s.isBooked).length;
            response += `${t.name} (${t.sport})\n  Location: ${t.location}\n  Available slots: ${availableSlots}/${t.totalSlots}\n  Price: Rs.${t.pricePerSlot}/slot\n\n`;
          });
          response += "Go to Turf section to book a slot!";
        }
        break;
      }

      case 'complaint':
        response = "To raise a complaint:\n1. Go to the Complaints section\n2. Select complaint type (bullying, maintenance, harassment, ragging, etc.)\n3. Enter title and description\n4. Choose to submit anonymously if needed\n5. Submit\n\nYou can track your complaint status in the same section.";
        break;

      case 'room': {
        const rooms = await Room.find({});
        if (rooms.length === 0) {
          response = "No rooms configured yet.";
        } else {
          response = "Room allocation status:\n\n";
          rooms.forEach(r => {
            const status = r.isAllocated ? `Allocated to ${r.allocatedTo}` : "Available";
            response += `${r.name} (${r.building})\n  Type: ${r.type} | Capacity: ${r.capacity}\n  Status: ${status}\n\n`;
          });
        }
        break;
      }

      default:
        response = "I'm not sure I understand. You can ask me about:\n- Cafeteria (availability, menu, booking)\n- Parking (bike/car spots)\n- Exams (schedule, upcoming)\n- Doctors (availability)\n- Turf (booking)\n- Complaints\n- Room allocation\n\nTry asking something like 'Any cafeteria slots left?' or 'When is my next exam?'";
    }

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ response: "Sorry, I encountered an error. Please try again." }, { status: 500 });
  }
}
