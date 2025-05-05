const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userRole: {
    type: String,
    enum: ['customer', 'tailor'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String, // e.g., "order", "review", "system"
    default: "system",
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);

