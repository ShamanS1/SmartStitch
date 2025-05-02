const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dressStyleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DressStyle', required: true },
  dressName: { type: String, required: true },
  price: { type: Number, required: true },
  orderStatus: { type: String, enum: ['pending', 'processing', 'completed', 'delivered'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['not started', 'pickup done', 'out for delivery', 'delivered'], default: 'not started' },
  clothReceived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);