import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String, // Hashed password
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'guard', 'resident'],
    required: true,
    default: 'resident'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
