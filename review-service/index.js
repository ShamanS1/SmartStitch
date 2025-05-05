require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Middleware
app.use(express.json());  // To parse JSON request bodies

// Routes
app.use('/api/reviews', reviewRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB: ', err));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Review-Service running on port ${port}`));
