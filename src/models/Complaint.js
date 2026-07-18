import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bullying', 'maintenance', 'harassment', 'ragging', 'infrastructure', 'other'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved', 'rejected'], default: 'pending' },
  adminResponse: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
}, { timestamps: true });

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
