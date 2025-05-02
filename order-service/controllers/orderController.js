const Order = require('../models/Order');

// 1. Place Order (Customer)
exports.placeOrder = async (req, res) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied: Customers only' });
  }
  try {
    const { customerId, tailorId, dressStyleId, dressName, price } = req.body;
    const order = new Order({
      customerId,
      tailorId,
      dressStyleId,
      dressName,
      price
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error });
  }
};

// 2. Get Customer Orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer orders', error });
  }
};

// 3. Get Tailor Orders
exports.getTailorOrders = async (req, res) => {
  if (!req.user || req.user.role !== 'tailor') {
    return res.status(403).json({ message: 'Access denied: Tailors only' });
  }
  try {
    const { tailorId } = req.params;
    const orders = await Order.find({ tailorId });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tailor orders', error });
  }
};

// 4. Update Order Status (Tailor)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};

// 5. Update Delivery Status (Tailor/Delivery)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { deliveryStatus }, { new: true });
    res.status(200).json({ message: 'Delivery status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery status', error });
  }
};

// 6. Mark Cloth as Received (Tailor)
exports.markClothReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(orderId, { clothReceived: true }, { new: true });
    res.status(200).json({ message: 'Cloth marked as received', order });
  } catch (error) {
    res.status(500).json({ message: 'Error marking cloth as received', error });
  }
};