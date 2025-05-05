const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db'); // optional if using MongoDB

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

require('./socket')(io); // Pass io to socket logic

const PORT = process.env.PORT || 8003;
server.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`));

