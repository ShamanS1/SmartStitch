const axios = require('axios');
const Message = require('./models/Message'); // Optional
const ORDER_SERVICE_URL = 'http://localhost:5002/api/orders'; // adjust if needed

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinOrderRoom', async ({ orderId, userId }) => {
      console.log(`[joinOrderRoom] socket.id=${socket.id}, userId=${userId}, orderId=${orderId}`);
      try {
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/status/${orderId}`);
        console.log(`[joinOrderRoom] Order status for ${orderId}:`, data.orderStatus);
        if (data.orderStatus === 'completed') {
          console.log(`[joinOrderRoom] Chat closed for order ${orderId}`);
          return socket.emit('error', 'Chat is closed for this order');
        }
        socket.join(`order_${orderId}`);
        console.log(`[joinOrderRoom] socket.id=${socket.id} joined room order_${orderId}`);
        socket.emit('joinedRoom', `Joined chat for order ${orderId}`);
      } catch (err) {
        console.error(`[joinOrderRoom] Error:`, err.message);
        socket.emit('error', 'Order validation failed');
      }
    });

    socket.on('sendMessage', async ({ orderId, from, to, message }) => {
      console.log(`[sendMessage] from=${from}, to=${to}, orderId=${orderId}, message=${message}`);
      try {
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/status/${orderId}`);
        console.log(`[sendMessage] Order status for ${orderId}:`, data.orderStatus);
        if (data.orderStatus === 'completed') {
          console.log(`[sendMessage] Chat closed for order ${orderId}`);
          return socket.emit('error', 'Chat is closed');
        }

        const msg = { orderId, from, to, message, timestamp: new Date() };
        await Message.create(msg); // optional
        console.log(`[sendMessage] Emitting message to room order_${orderId}:`, msg);
        io.to(`order_${orderId}`).emit('message', msg);
      } catch (err) {
        console.error(`[sendMessage] Error:`, err.message);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

