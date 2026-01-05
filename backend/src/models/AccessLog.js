const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'personType' // Dynamic ref based on personType
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
  }
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);
