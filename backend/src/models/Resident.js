import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  apartment: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('Resident', residentSchema);
