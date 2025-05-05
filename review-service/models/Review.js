const mongoose = require('mongoose');

// Review schema for feedback on tailors or dress styles
const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'  },  // Tailor being reviewed
  dressStyleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DressStyle' },  // Optional: If reviewing a dress style
  rating: { type: Number, required: true, min: 1, max: 5 },  // Rating from 1 to 5
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Ensure no duplicate reviews from same customer for the same tailor/dress style
reviewSchema.index({ customerId: 1, tailorId: 1, dressStyleId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
