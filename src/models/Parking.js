import mongoose from 'mongoose';

const ParkingSchema = new mongoose.Schema({
  type: { type: String, enum: ['bike', 'car'], required: true },
  location: { type: String, required: true },
  totalSpots: { type: Number, required: true },
  availableSpots: { type: Number, required: true },
  pricePerHour: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Parking || mongoose.model('Parking', ParkingSchema);
