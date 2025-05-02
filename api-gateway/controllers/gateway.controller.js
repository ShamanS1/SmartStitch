import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const authServiceURL = process.env.AUTH_SERVICE_URL;
const storeServiceURL = process.env.STORE_SERVICE_URL;
const tailorServiceURL = process.env.TAILOR_SERVICE_URL;

export const forwardToAuth = async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${authServiceURL}${req.originalUrl.replace('/api/auth', '')}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth service error' });
  }
};

export const forwardToStore = async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${storeServiceURL}${req.originalUrl.replace('/api/store', '')}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Store service error' });
  }
};

export const forwardToTailor = async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${tailorServiceURL}${req.originalUrl.replace('/api/tailors', '')}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Tailor service error' });
  }
};
