import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import gatewayRoutes from './routes/gateway.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/api', gatewayRoutes);

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});

