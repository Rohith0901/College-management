import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  code: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, default: '2 hours' },
  room: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  type: { type: String, enum: ['midterm', 'final', 'practical', 'internal'], default: 'final' },
}, { timestamps: true });

export default mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
