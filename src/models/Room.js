import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['classroom', 'lab', 'seminar', 'auditorium'], default: 'classroom' },
  department: { type: String },
  isAllocated: { type: Boolean, default: false },
  allocatedTo: { type: String },
  allocatedDepartment: { type: String },
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);
