const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// Importing Routes
const tailorRoutes = require('./routes/tailor.routes');
//const { db } = require('./models/TailorProfile');

// Middleware for parsing JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serving static files for images
app.use('/uploads/tailors', express.static(path.join(__dirname, 'uploads/tailors')));
app.use('/uploads/dressStyles', express.static(path.join(__dirname, 'uploads/dressStyles')));

// API Routes
app.use('/api/tailors', tailorRoutes);

// Connect to MongoDB
connectDB();

// Set up server port
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

