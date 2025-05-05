const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

router.post('/', sendNotification); // Send new notification
router.get('/:userId', getUserNotifications); // Get all for a user
router.patch('/:id/read', markAsRead); // Mark one as read

module.exports = router;

