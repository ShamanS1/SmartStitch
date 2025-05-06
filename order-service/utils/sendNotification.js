// utils/sendNotification.js
const axios = require('axios');
const NOTIFICATION_SERVICE_URL = 'http://localhost:5005/api/notifications';

/**
 * Send a notification to a user
 * @param {String} userId - ID of the recipient user
 * @param {String} userRole - 'customer' or 'tailor'
 * @param {String} message - Notification message
 * @param {String} type - Notification type ('order', 'review', etc.)
 */

const sendNotification = async (userId, userRole, message, type = 'order') => {
  try {
    await axios.post(NOTIFICATION_SERVICE_URL, {
      userId,
      userRole,
      message,
      type
    });
    console.log(`[Notification] Sent to ${userRole} (${userId}): ${message}`);
  } catch (err) {
    console.error(`[Notification] Failed:`, err.message);
  }
};

module.exports = sendNotification;
