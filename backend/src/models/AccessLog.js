import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'personType'
  },
  personType: {
    type: String,
    required: true,
    enum: ['Resident', 'Visitor']
  },
  timeIn: {
    type: Date
  },
  timeOut: {
    type: Date
  },
  method: {
    type: String,
    enum: ['face', 'manual'],
    required: true
  },
  score: {
    type: Number
  },
  deviceId: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('AccessLog', accessLogSchema);
