const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tailorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  dressStyleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  dressName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'ready for pickup'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  clothReceived: {
    type: Boolean,
    default: false, // Tailor marks this when customer gives cloth
  },
  clothCollected: {
    type: Boolean,
    default: false, // Tailor marks this when customer collects and pays
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
