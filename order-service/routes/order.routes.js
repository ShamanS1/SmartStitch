const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth'); // JWT Middleware

// Order Routes
router.post('/create', authenticate, orderController.createOrder);
router.get('/customer', authenticate, orderController.getCustomerOrders);
router.get('/tailor', authenticate, orderController.getTailorOrders);
// Get order by ID for customer
router.get('/customer/:id', authenticate, orderController.getCustomerOrderById);
// Get order by ID for tailor
router.get('/tailor/:id', authenticate, orderController.getTailorOrderById);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/update/:id', authenticate, orderController.updateOrderStatus);

// OrderService: Add this route
router.get('/status/:orderId', orderController.getOrderStatus);
  

module.exports = router;
