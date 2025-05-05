const DressStyle = require('../models/DressStyle');
const axios = require('axios');
const AUTH_SERVICE_URL = 'http://localhost:5000/api/auth'; // You can load this from env

// ✅ Update Tailor Profile
exports.updateProfile = async (req, res) => {
  const { name, email, address, profileImage, phone, shopName, shopStatus } = req.body;
  const userId = req.params.id;
  try {
    // Prepare the update data
    const updateData = {
      name,
      email,
      shopName,
      address,
      profileImage,
      phone,
      shopStatus
    };

    // Send updated data to AuthService to update the Auth DB (User model)
    const response = await axios.put(`${AUTH_SERVICE_URL}/update-profile/${userId}`, updateData, {
      headers: {
        Authorization: `Bearer ${req.token}`  // Pass the JWT token for authentication
      }
    });

    if (response.status !== 200) {
      return res.status(500).json({ message: 'Failed to update profile in Auth DB' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      updatedTailorProfile: response.data.data // Data returned from Auth service
    });
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error);
    return res.status(500).json({ message: 'Error updating profile', error });
  }
};

// ✅ Get Tailor Profile
exports.getTailorProfile = async (req, res) => {
  const tailorId = req.params.id;

  try {
    // Call Auth Service to get the tailor profile (stored in User model)
    const response = await axios.get(`${AUTH_SERVICE_URL}/tailor/${tailorId}`, {
      headers: {
        Authorization: `Bearer ${req.token}`
      }
    });

    res.status(200).json(response.data);  // Send response from Auth Service
  } catch (error) {
    console.error('Error fetching tailor profile:', error.response?.data || error);
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// ✅ Add Dress Style
exports.addDressStyle = async (req, res) => {
  // Only allow if user is a tailor
  if (!req.user || req.user.role !== 'tailor') {
    return res.status(403).json({ message: 'Access denied. Only tailors can add dress styles.' });
  }
  try {
    const { name, description, price, category} = req.body; // Get tailorId from params
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const newStyle = new DressStyle({
      name,
      description,
      price,
      tailor: req.params.id,
      category,
      imageUrl,
    });

    await newStyle.save();
    res.status(201).json({ message: 'Dress style added', style: newStyle });
  } catch (error) {
    res.status(500).json({ message: 'Error adding dress style', error });
  }
};

// ✅ Update Dress Style
exports.updateDressStyle = async (req, res) => {
  // Only allow if user is a tailor
  if (!req.user || req.user.role !== 'tailor') {
    return res.status(403).json({ message: 'Access denied. Only tailors can update dress styles.' });
  }
  try {
    const styleId = req.params.id;
    const updatedData = req.body;

    if (req.file) {
      updatedData.imageUrl = req.file.path;
    }

    const updatedStyle = await DressStyle.findByIdAndUpdate(styleId, updatedData, { new: true });

    if (!updatedStyle) {
      return res.status(404).json({ message: 'Dress style not found' });
    }

    res.status(200).json({ message: 'Dress style updated', style: updatedStyle });
  } catch (error) {
    res.status(500).json({ message: 'Error updating dress style', error });
  }
};

// ✅ Delete Dress Style
exports.deleteDressStyle = async (req, res) => {
  // Only allow if user is a tailor
  if (!req.user || req.user.role !== 'tailor') {
    return res.status(403).json({ message: 'Access denied. Only tailors can delete dress styles.' });
  }
  try {
    const styleId = req.params.id;
    const deleted = await DressStyle.findByIdAndDelete(styleId);

    if (!deleted) {
      return res.status(404).json({ message: 'Dress style not found' });
    }

    res.status(200).json({ message: 'Dress style deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dress style', error });
  }
};

// ✅ Get All Dress Styles of Tailor
exports.getTailorDressStyles = async (req, res) => {
  try {
    const { tailorId } = req.params;
    const styles = await DressStyle.find({ tailorId });
    res.status(200).json(styles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dress styles', error });
  }
};

// Get Dress Style by Dress ID
exports.getDressStyleById = async (req, res) => {
  const dressId = req.params.id;
  try {
    const dressStyle = await DressStyle.findById(dressId);
    if (!dressStyle) {
      return res.status(404).json({ message: 'Dress style not found' });
    }
    res.status(200).json(dressStyle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dress style', error });
  }
};


// PATCH /dress-style/update-rating/:id
exports.updateDressRating = async (req, res) => {
  const dressStyleId = req.params.id;
  const { rating } = req.body;

  try {
    const dress = await DressStyle.findById(dressStyleId);
    if (!dress) {
      return res.status(404).json({ message: 'Dress style not found' });
    }

    dress.rating = rating;
    await dress.save();

    res.status(200).json({ message: 'Dress style rating updated', rating });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update dress style rating', error: err.message });
  }
};
