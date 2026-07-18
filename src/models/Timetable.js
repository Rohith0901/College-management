import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  schedule: [{
    day: { type: String, required: true },
    periods: [{
      subject: { type: String, required: true },
      time: { type: String, required: true },
      room: { type: String },
      faculty: { type: String },
    }],
  }],
}, { timestamps: true });

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
