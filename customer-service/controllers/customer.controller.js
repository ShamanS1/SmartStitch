const axios = require('axios');
const AUTH_SERVICE_URL = 'http://localhost:5000/api/auth';
 
// Get Full Customer Profile
exports.getCustomerProfile = async (req, res) => {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/customer-profile/${req.params.id}`, {
        headers: {
          Authorization: `Bearer ${req.token}`
        }
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching customer profile:', error.response?.data || error);
      res.status(500).json({ message: 'Error fetching customer profile', error });
    }
  };
  

// Update Customer Profile via Auth Service
exports.updateProfile = async (req, res) => {
    const userId = req.params.userid; // Ensure this matches your route param
    const { name, email, profileImage, address } = req.body;
  
    try {
      const updateData = { name, email, profileImage, address };
  
      const response = await axios.put(`${AUTH_SERVICE_URL}/update-customer-profile/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${req.token}`
        }
      });
  
      if (response.status !== 200) {
        return res.status(500).json({ message: 'Failed to update customer profile in Auth DB' });
      }
  
      return res.status(200).json({
        message: 'Customer profile updated successfully',
        updatedCustomerProfile: response.data.data
      });
    } catch (error) {
      console.error('Error updating customer profile:', error.response?.data || error);
      return res.status(500).json({ message: 'Error updating customer profile', error: error.response?.data || error.message });
    }
};
  
// Add Measurement
exports.addMeasurement = async (req, res) => {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/measurement/${req.params.id}`, req.body, {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error adding measurement', error });
    }
  };
  
  // Update Measurement
  exports.updateMeasurement = async (req, res) => {
    try {
      const response = await axios.put(`${AUTH_SERVICE_URL}/measurement/${req.params.id}/${req.params.profileId}`, req.body, {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error updating measurement', error });
    }
  };
  
  // Delete Measurement
  exports.deleteMeasurement = async (req, res) => {
    try {
      const response = await axios.delete(`${AUTH_SERVICE_URL}/measurement/${req.params.id}/${req.params.profileId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting measurement', error });
    }
  };
  
  // Get Measurements
  exports.getMeasurements = async (req, res) => {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/measurement/${req.params.id}`, {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching measurements', error });
    }
  };
  