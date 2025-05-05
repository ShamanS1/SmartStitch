const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth'); // JWT middleware

// Get full customer profile
router.get('/profile/:id', authenticate, customerController.getCustomerProfile);

// Update customer profile
router.put('/update-profile/:id', authenticate, customerController.updateProfile);

// Add measurement profile
router.post('/measurement/:id', authenticate, customerController.addMeasurement);

// Update measurement profile
router.put('/measurement/:id/:profileId', authenticate, customerController.updateMeasurement);

// Delete measurement profile
router.delete('/measurement/:id/:profileId', authenticate, customerController.deleteMeasurement);

// Get all measurement profiles for a customer
router.get('/measurement/:id', authenticate, customerController.getMeasurements);

module.exports = router;
