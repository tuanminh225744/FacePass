import mongoose from 'mongoose';

const faceEmbeddingSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  embedding: {
    type: [Number], // Vector
    required: true
  }
}, { timestamps: true });

export default mongoose.model('FaceEmbedding', faceEmbeddingSchema);
