// const Order = require('../models/Order');  // Assume an Order model exists

// // ✅ Get All Orders for Tailor
// exports.getOrdersForTailor = async (req, res) => {
//   try {
//     const orders = await Order.find({ tailorId: req.params.tailorId });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching orders', error });
//   }
// };

// // ✅ Update Order Status
// exports.updateOrderStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status, pickupStatus, deliveryStatus } = req.body;

//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { status, pickupStatus, deliveryStatus },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.status(200).json({ message: 'Order status updated', order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating order status', error });
//   }
// };
