import mongoose from 'mongoose';

const CafeteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  operatingHours: { type: String, default: '8:00 AM - 8:00 PM' },
  image: { type: String, default: '/cafeteria.jpg' },
  menu: [{
    item: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    category: { type: String, enum: ['veg', 'non-veg', 'snacks', 'beverages'], default: 'veg' },
  }],
}, { timestamps: true });

export default mongoose.models.Cafeteria || mongoose.model('Cafeteria', CafeteriaSchema);
