const axios = require('axios');
const Order = require('../models/Order');
const {auth} = require('../middleware/auth');


const AUTH_SERVICE_URL = 'http://localhost:5000/api/auth'; // Replace with actual
const TAILOR_SERVICE_URL = 'http://localhost:5001/api/tailors'; // Replace with actual

// ✅ Create Order
exports.createOrder = async (req, res) => {
  const customerId = req.user.userId;
  const { dressStyleId } = req.body;

  try {
    // Forward the Authorization header
    const headers = { Authorization: req.headers.authorization };
    // Get DressStyle details
    const dressRes = await axios.get(`${TAILOR_SERVICE_URL}/dress-style/${dressStyleId}`, { headers });
    const dress = dressRes.data;
    if (!dress) return res.status(404).json({ message: 'Dress style not found' });

    // Get tailorId from the dress style
    const tailorId = dress.tailor;

    // Optionally validate customer and tailor exist
    // const [customerRes, tailorRes] = await Promise.all([
    //   axios.get(`${AUTH_SERVICE_URL}/users/${customerId}`, { headers }),
    //   axios.get(`${AUTH_SERVICE_URL}/users/${tailorId}`, { headers })
    // ]);

    const order = new Order({
      customerId,
      tailorId,
      dressStyleId,
      dressName: dress.name, // or dress.title depending on your schema
      price: dress.price,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      clothReceived: false,
      clothCollected: false
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// ✅ Get all orders for a customer
exports.getCustomerOrders = async (req, res) => {
  const customerId = req.user.userId;
  try {
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// ✅ Get all orders for a tailor
exports.getTailorOrders = async (req, res) => {
  const tailorId = req.user.id;
  try {
    const orders = await Order.find({ tailorId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// ✅ Update order status (status, payment, clothReceived, clothCollected)
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { orderStatus, paymentStatus, clothReceived, clothCollected } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, paymentStatus, clothReceived, clothCollected },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order updated successfully', order: updated });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// ✅ Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get single order by ID for customer (only if it belongs to them)
exports.getCustomerOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found or access denied' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get single order by ID for tailor (only if it belongs to them)
exports.getTailorOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, tailorId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found or access denied' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};
