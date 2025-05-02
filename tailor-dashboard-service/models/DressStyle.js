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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DressStyle', DressStyleSchema);
