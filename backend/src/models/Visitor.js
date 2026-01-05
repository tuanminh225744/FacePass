const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cccd: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
