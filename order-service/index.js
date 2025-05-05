const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/orderdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
