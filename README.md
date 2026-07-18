# CollegeHub - College Management System

> **Live Demo:** https://college-management-system-sand.vercel.app

A comprehensive college management platform with AI chatbot integration.

## Features

- **Cafeteria Booking** - Book tables, pre-order food, check slot availability
- **Parking Allocation** - Reserve bike & car parking spots
- **Exam Schedules** - View exam timetables with countdowns
- **Timetable** - Weekly class schedule viewer
- **Turf Booking** - Book sports grounds
- **Complaint System** - Raise issues (anonymous option)
- **College Hospital** - Check doctor availability
- **Room Allocation** - View room assignments & attendance
- **AI Chatbot** - Ask anything about the system (rule-based, free)

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (free tier)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI**: Rule-based chatbot (no external API)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `.env.local` with your URI:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/college-management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Open in Browser
- **Landing Page**: http://localhost:3000
- **Student Login**: student@college.edu / student123
- **Admin Login**: admin@college.edu / admin123

## Deployment (Free)

### Vercel
1. Push to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your secret key
5. Deploy!

## Project Structure

```
college-management-system/
├── src/
│   ├── app/              # Pages & API routes
│   │   ├── api/          # Backend API
│   │   ├── cafeteria/    # Cafeteria booking
│   │   ├── parking/      # Parking allocation
│   │   ├── exams/        # Exam schedules
│   │   ├── timetable/    # Class timetable
│   │   ├── turf/         # Turf booking
│   │   ├── complaints/   # Complaint system
│   │   ├── hospital/     # Doctor availability
│   │   ├── admin/        # Admin dashboard
│   │   └── dashboard/    # Student dashboard
│   ├── components/       # Reusable components
│   ├── models/           # MongoDB schemas
│   ├── lib/              # Utilities
│   └── context/          # React context
├── scripts/              # Seed script
└── .env.local            # Environment variables
```

## AI Chatbot

The chatbot can answer queries like:
- "Any cafeteria slots left?"
- "When is my next exam?"
- "Is Dr. Smith available?"
- "Book a parking spot"
- "Available turfs"

Built with rule-based intent matching (free, no API needed).
