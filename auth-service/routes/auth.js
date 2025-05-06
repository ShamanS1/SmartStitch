const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration and login
router.post('/register', authController.upload, authController.register);
router.post('/login', authController.login);

// Forgot password and reset password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Update profile
router.put('/update-profile/:id', authController.updateProfile);

// Get tailor profile   
router.get('/tailor/:id', authController.getTailorProfile);

// Get customer profile
router.put('/update-customer-profile/:id', authController.updateCustomerProfile);
router.get('/customer-profile/:id', authController.getCustomerProfile);


//Measurements
router.post('/measurement/:id', authController.addMeasurementProfile);
router.put('/measurement/:id/:profileId', authController.updateMeasurementProfile);
router.delete('/measurement/:id/:profileId', authController.deleteMeasurementProfile);
router.get('/measurement/:id', authController.getMeasurementProfiles);

//rating
router.patch('/update-rating/:id', authController.updateTailorRating);

// Get user by ID (generic)
router.get('/user/:id', authController.getUserById);


module.exports = router;