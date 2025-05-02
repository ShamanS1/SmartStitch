const express = require('express');
const router = express.Router();
const tailorController = require('../controllers/tailor.controller');
const { authenticate } = require('../middleware/auth'); // JWT middleware

// Update profile (this will call AuthService for updating)
router.put('/update-profile/:id', authenticate, tailorController.updateProfile);

// Get tailor profile
router.get('/profile/:id', authenticate, tailorController.getTailorProfile);

// Dress style CRUD routes
router.post('/add-dress-style/:id', authenticate, tailorController.addDressStyle);
router.put('/update-dress-style/:id', authenticate, tailorController.updateDressStyle);
router.delete('/delete-dress-style/:id', authenticate, tailorController.deleteDressStyle);
router.get('/dress-styles/:tailorId', authenticate, tailorController.getTailorDressStyles);

module.exports = router;
