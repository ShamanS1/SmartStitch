const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const customerRoutes = require('./routes/customer.routes');
app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Customer Service running on port ${PORT}`));

