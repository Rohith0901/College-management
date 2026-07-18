require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'student' }, department: String, year: Number,
  semester: Number, studentId: String, phone: String,
}, { timestamps: true });

const CafeteriaSchema = new mongoose.Schema({
  name: String, location: String, totalSlots: Number, operatingHours: String,
  menu: [{ item: String, price: Number, available: Boolean, category: String }],
}, { timestamps: true });

const ParkingSchema = new mongoose.Schema({
  type: String, location: String, totalSpots: Number, availableSpots: Number, pricePerHour: Number,
}, { timestamps: true });

const ExamSchema = new mongoose.Schema({
  subject: String, code: String, date: Date, time: String, duration: String,
  room: String, department: String, year: Number, semester: Number, type: String,
}, { timestamps: true });

const TimetableSchema = new mongoose.Schema({
  department: String, year: Number, semester: Number,
  schedule: [{ day: String, periods: [{ subject: String, time: String, room: String, faculty: String }] }],
}, { timestamps: true });

const RoomSchema = new mongoose.Schema({
  name: String, building: String, capacity: Number, type: String, department: String,
  isAllocated: Boolean, allocatedTo: String, allocatedDepartment: String,
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  name: String, specialization: String, available: Boolean,
  schedule: [{ day: String, startTime: String, endTime: String }],
  contact: String, room: String,
}, { timestamps: true });

const TurfSchema = new mongoose.Schema({
  name: String, sport: String, location: String, totalSlots: Number, pricePerSlot: Number,
  slots: [{ time: String, isBooked: Boolean, bookedBy: mongoose.Schema.Types.ObjectId, date: Date }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Cafeteria = mongoose.model('Cafeteria', CafeteriaSchema);
const Parking = mongoose.model('Parking', ParkingSchema);
const Exam = mongoose.model('Exam', ExamSchema);
const Timetable = mongoose.model('Timetable', TimetableSchema);
const Room = mongoose.model('Room', RoomSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Turf = mongoose.model('Turf', TurfSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([User.deleteMany({}), Cafeteria.deleteMany({}), Parking.deleteMany({}), Exam.deleteMany({}), Timetable.deleteMany({}), Room.deleteMany({}), Doctor.deleteMany({}), Turf.deleteMany({})]);

    const adminPass = await bcrypt.hash('admin123', 12);
    const studentPass = await bcrypt.hash('student123', 12);

    await User.create([
      { name: 'Admin User', email: 'admin@college.edu', password: adminPass, role: 'admin', department: 'Administration' },
      { name: 'Rahul Kumar', email: 'student@college.edu', password: studentPass, role: 'student', department: 'Computer Science', year: 3, semester: 5, studentId: 'CS2021001', phone: '9876543210' },
      { name: 'Priya Sharma', email: 'priya@college.edu', password: studentPass, role: 'student', department: 'Computer Science', year: 3, semester: 5, studentId: 'CS2021002' },
      { name: 'Amit Singh', email: 'amit@college.edu', password: studentPass, role: 'student', department: 'Information Technology', year: 2, semester: 3, studentId: 'IT2022001' },
    ]);

    await Cafeteria.create([
      {
        name: 'Main Canteen', location: 'Block A - Ground Floor', totalSlots: 20, operatingHours: '8:00 AM - 8:00 PM',
        menu: [
          { item: 'Rice & Dal', price: 40, available: true, category: 'veg' },
          { item: 'Chicken Biryani', price: 80, available: true, category: 'non-veg' },
          { item: 'Veg Thali', price: 50, available: true, category: 'veg' },
          { item: 'Egg Curry', price: 60, available: true, category: 'non-veg' },
          { item: 'Samosa (2 pcs)', price: 20, available: true, category: 'snacks' },
          { item: 'Tea', price: 10, available: true, category: 'beverages' },
          { item: 'Coffee', price: 15, available: true, category: 'beverages' },
          { item: 'Cold Drink', price: 20, available: true, category: 'beverages' },
        ],
      },
      {
        name: 'Food Court', location: 'Block B - 1st Floor', totalSlots: 30, operatingHours: '9:00 AM - 7:00 PM',
        menu: [
          { item: 'Paneer Butter Masala', price: 70, available: true, category: 'veg' },
          { item: 'Chicken Fried Rice', price: 60, available: true, category: 'non-veg' },
          { item: 'Maggi', price: 30, available: true, category: 'snacks' },
          { item: 'Veg Burger', price: 40, available: true, category: 'snacks' },
          { item: 'Fresh Juice', price: 25, available: true, category: 'beverages' },
        ],
      },
      {
        name: 'Juice Corner', location: 'Near Library', totalSlots: 10, operatingHours: '10:00 AM - 6:00 PM',
        menu: [
          { item: 'Mango Shake', price: 30, available: true, category: 'beverages' },
          { item: 'Banana Shake', price: 25, available: true, category: 'beverages' },
          { item: 'Fresh Lime Soda', price: 15, available: true, category: 'beverages' },
          { item: 'Buttermilk', price: 10, available: true, category: 'beverages' },
        ],
      },
    ]);

    await Parking.create([
      { type: 'bike', location: 'Block A Parking', totalSpots: 100, availableSpots: 72, pricePerHour: 5 },
      { type: 'car', location: 'Block A Parking', totalSpots: 50, availableSpots: 31, pricePerHour: 15 },
      { type: 'bike', location: 'Block C Parking', totalSpots: 80, availableSpots: 55, pricePerHour: 5 },
      { type: 'car', location: 'Block C Parking', totalSpots: 30, availableSpots: 22, pricePerHour: 15 },
    ]);

    const today = new Date();
    const examDates = [
      new Date(today.getTime() + 5 * 86400000),
      new Date(today.getTime() + 8 * 86400000),
      new Date(today.getTime() + 12 * 86400000),
      new Date(today.getTime() + 15 * 86400000),
      new Date(today.getTime() + 20 * 86400000),
      new Date(today.getTime() + 25 * 86400000),
    ];

    await Exam.create([
      { subject: 'Data Structures', code: 'CS301', date: examDates[0], time: '10:00 AM - 12:00 PM', duration: '2 hours', room: 'Hall A', department: 'Computer Science', year: 3, semester: 5, type: 'midterm' },
      { subject: 'Database Management', code: 'CS302', date: examDates[1], time: '10:00 AM - 12:00 PM', duration: '2 hours', room: 'Hall A', department: 'Computer Science', year: 3, semester: 5, type: 'midterm' },
      { subject: 'Operating Systems', code: 'CS303', date: examDates[2], time: '2:00 PM - 4:00 PM', duration: '2 hours', room: 'Hall B', department: 'Computer Science', year: 3, semester: 5, type: 'midterm' },
      { subject: 'Computer Networks', code: 'CS304', date: examDates[3], time: '10:00 AM - 12:00 PM', duration: '2 hours', room: 'Hall A', department: 'Computer Science', year: 3, semester: 5, type: 'final' },
      { subject: 'Software Engineering', code: 'CS305', date: examDates[4], time: '2:00 PM - 4:00 PM', duration: '2 hours', room: 'Hall B', department: 'Computer Science', year: 3, semester: 5, type: 'final' },
      { subject: 'Web Technologies', code: 'CS306', date: examDates[5], time: '10:00 AM - 12:00 PM', duration: '2 hours', room: 'Lab 1', department: 'Computer Science', year: 3, semester: 5, type: 'practical' },
    ]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const csSubjects = [
      ['Data Structures', 'DBMS', 'OS', 'CN', 'Software Eng', 'Web Tech'],
      ['Algorithms', 'Networks', 'Compiler Design', 'AI/ML', 'Cloud Computing', 'Project Lab'],
    ];
    const rooms = ['Room 301', 'Room 302', 'Lab 1', 'Room 301', 'Room 302', 'Lab 2'];
    const faculty = ['Dr. Sharma', 'Prof. Gupta', 'Dr. Verma', 'Prof. Singh', 'Dr. Kumar', 'Prof. Reddy'];

    for (let year = 3; year <= 4; year++) {
      const schedule = days.map((day, di) => ({
        day,
        periods: Array.from({ length: 6 }, (_, pi) => ({
          subject: csSubjects[year - 3][(di + pi) % 6],
          time: `${8 + pi}:00 - ${9 + pi}:00`,
          room: rooms[pi],
          faculty: faculty[pi],
        })),
      }));
      await Timetable.create({ department: 'Computer Science', year, semester: year === 3 ? 5 : 7, schedule });
    }

    await Room.create([
      { name: 'Room 101', building: 'Block A', capacity: 60, type: 'classroom', department: 'Computer Science' },
      { name: 'Room 102', building: 'Block A', capacity: 60, type: 'classroom', department: 'Computer Science' },
      { name: 'Room 201', building: 'Block A', capacity: 40, type: 'classroom', department: 'Information Technology' },
      { name: 'Lab 1', building: 'Block B', capacity: 40, type: 'lab', department: 'Computer Science' },
      { name: 'Lab 2', building: 'Block B', capacity: 40, type: 'lab', department: 'Information Technology' },
      { name: 'Hall A', building: 'Block C', capacity: 200, type: 'auditorium' },
      { name: 'Hall B', building: 'Block C', capacity: 150, type: 'seminar' },
      { name: 'Seminar Hall', building: 'Block D', capacity: 100, type: 'seminar' },
    ]);

    await Doctor.create([
      {
        name: 'Rajesh Gupta', specialization: 'General Physician', available: true, room: 'Room 101', contact: '+91-9876543211',
        schedule: [
          { day: 'Monday', startTime: '9:00', endTime: '13:00' },
          { day: 'Tuesday', startTime: '9:00', endTime: '13:00' },
          { day: 'Wednesday', startTime: '9:00', endTime: '13:00' },
          { day: 'Thursday', startTime: '9:00', endTime: '13:00' },
          { day: 'Friday', startTime: '9:00', endTime: '13:00' },
        ],
      },
      {
        name: 'Sneha Patel', specialization: 'Dentist', available: true, room: 'Room 102', contact: '+91-9876543212',
        schedule: [
          { day: 'Monday', startTime: '10:00', endTime: '14:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Friday', startTime: '10:00', endTime: '14:00' },
        ],
      },
      {
        name: 'Anil Kumar', specialization: 'Orthopedic', available: false, room: 'Room 103', contact: '+91-9876543213',
        schedule: [
          { day: 'Tuesday', startTime: '14:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
        ],
      },
    ]);

    await Turf.create([
      {
        name: 'Football Ground', sport: 'Football', location: 'Sports Complex', totalSlots: 8, pricePerSlot: 100,
        slots: [
          { time: '6:00-7:00', isBooked: false },
          { time: '7:00-8:00', isBooked: true, date: today },
          { time: '16:00-17:00', isBooked: false },
          { time: '17:00-18:00', isBooked: false },
        ],
      },
      {
        name: 'Basketball Court', sport: 'Basketball', location: 'Sports Complex', totalSlots: 6, pricePerSlot: 50,
        slots: [
          { time: '6:00-7:00', isBooked: false },
          { time: '7:00-8:00', isBooked: false },
          { time: '16:00-17:00', isBooked: true, date: today },
        ],
      },
      {
        name: 'Cricket Ground', sport: 'Cricket', location: 'Main Ground', totalSlots: 4, pricePerSlot: 200,
        slots: [
          { time: '6:00-8:00', isBooked: false },
          { time: '16:00-18:00', isBooked: false },
        ],
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Student: student@college.edu / student123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
