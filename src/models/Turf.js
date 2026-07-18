import mongoose from 'mongoose';

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  location: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  pricePerSlot: { type: Number, default: 0 },
  slots: [{
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date },
  }],
}, { timestamps: true });

export default mongoose.models.Turf || mongoose.model('Turf', TurfSchema);
