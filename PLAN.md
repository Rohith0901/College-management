# College Management System - Project Plan

## Overview
A comprehensive college management platform with AI chatbot integration, built for free deployment.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (free tier)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI Chatbot**: Rule-based (no external API)
- **Deployment**: Vercel (free)

## Modules

### 1. Authentication
- Student registration & login
- Admin login
- JWT-based session management
- Role-based access control

### 2. Dashboard
- Central hub with module cards
- Quick stats (upcoming exams, active bookings, etc.)
- Notifications panel

### 3. Cafeteria Booking
- View all cafeterias with menus
- Book table slots (time-based)
- Pre-order food for next day
- Real-time slot availability
- Booking history

### 4. Parking Allocation
- View bike/car parking availability
- Allocate parking spot
- QR code for entry (mock)
- Release parking spot

### 5. Exam Schedule
- View exam timetable by department/year
- Countdown to next exam
- Download schedule as PDF
- AI reminders

### 6. Timetable
- View weekly class schedule
- Filter by department/year
- Add to calendar (mock)

### 7. Room Allocation
- Admin assigns rooms to classes
- View room availability
- Mark student attendance
- Attendance reports

### 8. Turf Booking
- View available turf slots
- Book turf for specific time
- Cancel booking
- View booking history

### 9. Complaint System
- Raise complaints (bullying, maintenance, etc.)
- Track complaint status
- Anonymous option
- Admin can view/respond

### 10. Hospital/Doctor
- View doctor availability
- Book appointment
- View department-wise doctors
- Emergency contact info

### 11. AI Chatbot
- Natural language query processing
- Slot availability checks
- Exam schedule queries
- Doctor availability
- Booking assistance
- Rule-based (free, no API)

## Database Schema

### users
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "student | admin",
  "department": "String",
  "year": "Number",
  "studentId": "String (unique)",
  "phone": "String",
  "createdAt": "Date"
}
```

### cafeterias
```json
{
  "_id": "ObjectId",
  "name": "String",
  "location": "String",
  "totalSlots": "Number",
  "operatingHours": "String",
  "menu": [{
    "item": "String",
    "price": "Number",
    "available": "Boolean"
  }],
  "image": "String"
}
```

### bookings
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "type": "cafeteria | parking | turf",
  "resourceId": "ObjectId",
  "date": "Date",
  "timeSlot": "String",
  "status": "pending | confirmed | cancelled",
  "details": "Object",
  "createdAt": "Date"
}
```

### parking
```json
{
  "_id": "ObjectId",
  "type": "bike | car",
  "location": "String",
  "totalSpots": "Number",
  "availableSpots": "Number",
  "pricePerHour": "Number"
}
```

### exams
```json
{
  "_id": "ObjectId",
  "subject": "String",
  "date": "Date",
  "time": "String",
  "duration": "String",
  "room": "String",
  "department": "String",
  "year": "Number",
  "type": "midterm | final | practical"
}
```

### timetable
```json
{
  "_id": "ObjectId",
  "department": "String",
  "year": "Number",
  "semester": "Number",
  "schedule": [{
    "day": "String",
    "periods": [{
      "subject": "String",
      "time": "String",
      "room": "String",
      "faculty": "String"
    }]
  }]
}
```

### rooms
```json
{
  "_id": "ObjectId",
  "name": "String",
  "building": "String",
  "capacity": "Number",
  "type": "classroom | lab | seminar",
  "department": "String",
  "isAllocated": "Boolean",
  "allocatedTo": "String"
}
```

### complaints
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "type": "bullying | maintenance | harassment | other",
  "title": "String",
  "description": "String",
  "isAnonymous": "Boolean",
  "status": "pending | in-progress | resolved",
  "adminResponse": "String",
  "createdAt": "Date"
}
```

### doctors
```json
{
  "_id": "ObjectId",
  "name": "String",
  "specialization": "String",
  "available": "Boolean",
  "schedule": [{
    "day": "String",
    "startTime": "String",
    "endTime": "String"
  }],
  "contact": "String"
}
```

### turf
```json
{
  "_id": "ObjectId",
  "name": "String",
  "sport": "String",
  "location": "String",
  "totalSlots": "Number",
  "pricePerSlot": "Number",
  "slots": [{
    "time": "String",
    "isBooked": "Boolean",
    "bookedBy": "ObjectId"
  }]
}
```

### attendance
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId (ref: users)",
  "roomId": "ObjectId (ref: rooms)",
  "date": "Date",
  "present": "Boolean",
  "markedBy": "ObjectId (ref: users)"
}
```

## API Routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Cafeteria
- GET /api/cafeteria
- POST /api/cafeteria/book
- GET /api/cafeteria/availability

### Parking
- GET /api/parking
- POST /api/parking/allocate
- POST /api/parking/release

### Exams
- GET /api/exams
- GET /api/exams/upcoming

### Timetable
- GET /api/timetable

### Rooms
- GET /api/rooms
- POST /api/rooms/allocate
- POST /api/rooms/attendance

### Complaints
- GET /api/complaints
- POST /api/complaints

### Hospital
- GET /api/doctors
- POST /api/doctors/book

### Turf
- GET /api/turf
- POST /api/turf/book

### AI Chatbot
- POST /api/chat

## UI Pages

### Public
- `/` - Landing page
- `/login` - Login
- `/register` - Register

### Student
- `/dashboard` - Main dashboard
- `/cafeteria` - Book cafeteria
- `/parking` - Book parking
- `/exams` - Exam schedule
- `/timetable` - View timetable
- `/room-allocation` - View room allocation
- `/turf` - Book turf
- `/complaints` - Raise complaint
- `/hospital` - Check doctors

### Admin
- `/admin` - Admin dashboard
- `/admin/cafeteria` - Manage cafeterias
- `/admin/parking` - Manage parking
- `/admin/exams` - Manage exams
- `/admin/rooms` - Manage rooms
- `/admin/complaints` - View complaints
- `/admin/doctors` - Manage doctors
- `/admin/turf` - Manage turf

## Deployment Steps

1. Push to GitHub
2. Connect to Vercel
3. Add MongoDB Atlas connection string
4. Deploy

## Free Deployment Services
- **Vercel**: Frontend + API (free tier, 100GB bandwidth)
- **MongoDB Atlas**: Database (free tier, 512MB)
- **No external AI API needed**: Rule-based chatbot
