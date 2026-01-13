import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cccd: {
    type: String,
    required: false
  },
  purpose: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);
