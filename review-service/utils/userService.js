const axios = require('axios');
const AUTH_SERVICE_URL = 'http://localhost:5000/api/auth';

async function getUserById(userId) {
  try {
    const res = await axios.get(`${AUTH_SERVICE_URL}/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching user:', err.message);
    return null;
  }
}

module.exports = { getUserById };