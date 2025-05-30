const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Auth Service running on port ${process.env.PORT || 5000}`);
            console.log(`MongoDb Connected: ${process.env.MONGO_URI}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });