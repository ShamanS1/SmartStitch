require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));

