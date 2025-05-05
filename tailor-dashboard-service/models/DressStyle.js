const mongoose = require('mongoose');

const DressStyleSchema = new mongoose.Schema({
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the tailor user
    required: true,
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },  // URL of the dress style image
  rating: {
    type: Number,
    default: 0,  // Default to 0 if no reviews
    min: 0,
    max: 5, // Rating range between 0 and 5
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DressStyle', DressStyleSchema);
