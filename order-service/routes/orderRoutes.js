const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Place Order (customer only)
router.post('/orders', auth, orderController.placeOrder);

// Get Customer Orders
router.get('/orders/customer/:customerId', auth, orderController.getCustomerOrders);

// Get Tailor Orders
router.get('/orders/tailor/:tailorId', auth, orderController.getTailorOrders);

// Update Order Status
router.patch('/orders/:orderId/status', auth, orderController.updateOrderStatus);

// Update Delivery Status
router.patch('/orders/:orderId/delivery', auth, orderController.updateDeliveryStatus);

// Mark Cloth as Received
router.patch('/orders/:orderId/cloth-received', auth, orderController.markClothReceived);

module.exports = router;
