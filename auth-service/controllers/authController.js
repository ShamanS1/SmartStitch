const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helper to generate random tokens
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// At the top, require multer and path
const multer = require('multer');
const path = require('path');

// Set up multer storage (e.g., store in 'uploads/' folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Export upload middleware for use in routes
exports.upload = upload.single('profileImage');

// Helper to generate a 6-digit code as a string
function generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
    // For multipart/form-data, fields are in req.body, file in req.file
    let { name, email, password, confirmPassword, role, address, shopDetails } = req.body;
    let profileImage = req.file ? req.file.path : undefined;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'Passwords do not match' });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);

        // Parse shopDetails if present and is a string
        if (role === 'tailor' && typeof shopDetails === 'string') {
            try {
                shopDetails = JSON.parse(shopDetails);
            } catch (e) {
                return res.status(400).json({ msg: 'Invalid shop details format' });
            }
        }

        const user = new User({
            name,
            email,
            password: hashed,
            role,
            address,
            profileImage,
            shopDetails: role === 'tailor' ? shopDetails : undefined,
            emailVerified: false
        });

        // Generate 6-digit email verification code
        const emailCode = generate6DigitCode();
        user.emailVerificationToken = emailCode;

        await user.save();

        // Send verification email (implement sendVerificationEmail in your mailer)
        await mailer.sendVerificationEmail(user.email, emailCode);

        res.status(201).json({ msg: 'User registered. Please check your email to verify your account.', token: emailCode });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!user.emailVerified) {
            return res.status(403).json({ msg: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? '7d' : '1h' });

        if (rememberMe) {
            user.rememberToken = token;
            await user.save();
        }

        res.json({ token, role: user.role ,user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'No user with that email' });

        // Generate reset token
        const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email (implement sendResetPasswordEmail in your mailer)
        // await mailer.sendResetPasswordEmail(user.email, resetToken);

        res.json({ msg: 'Password reset email sent. Please check your inbox.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'Passwords do not match' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        // Find user by the 6-digit code
        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired code' });

        if (user.emailVerified) {
            return res.json({ msg: 'Email already verified.' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ msg: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};


// auth-service/controllers/authController.js

// Get Tailor Profile by ID
exports.getTailorProfile = async (req, res) => {
    const tailorId = req.params.id;
    try {
        const user = await User.findById(tailorId);
        if (!user || user.role !== 'tailor') {
            return res.status(404).json({ message: 'Tailor not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching tailor profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

// Update Tailor Profile
exports.updateProfile = async (req, res) => {
    const userId = req.params.id;
    const { name, email, address, profileImage, phone, shopName, shopStatus } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `User not found ${userId}` });
        }

        // Update basic fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (address) user.address = address;
        if (profileImage) user.profileImage = profileImage;

        // Update tailor-specific shop details if user is a tailor
        if (user.role === 'tailor') {
            if (!user.shopDetails) user.shopDetails = {};
            if (shopName) user.shopDetails.shopName = shopName;
            if (phone) user.shopDetails.phone = phone;
            if (shopStatus) user.shopDetails.shopStatus = shopStatus;
        }

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Update Customer Profile in Auth DB
exports.updateCustomerProfile = async (req, res) => {
    const userId = req.params.id;
    const { name, email, profileImage, address, measurementProfiles } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ message: 'Access denied or user not found' });
      }
  
      // Basic user info
      if (name) user.name = name;
      if (email) user.email = email;
      if (profileImage) user.profileImage = profileImage;
  
      // Address update (nested inside customerProfile)
      if (address) {
        if (!user.customerProfile) user.customerProfile = {};
        user.customerProfile.address = address;
      }

      // MeasurementProfiles update (array, nested inside customerProfile)
      if (measurementProfiles) {
        if (!user.customerProfile) user.customerProfile = {};
        user.customerProfile.measurementProfiles = measurementProfiles;
      }
  
      await user.save();
  
      res.status(200).json({
        message: 'Customer profile updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error updating customer profile:', error);
      res.status(500).json({ message: 'Error updating customer profile', error });
    }
  };
  
  // Get Full Customer Profile
exports.getCustomerProfile = async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId).select('-password');
      if (!user || user.role !== 'customer') {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      res.status(200).json({
        message: 'Customer profile fetched successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          address: user.customerProfile?.address || null,
          measurementProfiles: user.customerProfile?.measurementProfiles || []
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching customer profile', error: err });
    }
  };
  

  //Customer Measurements

  // Add a new measurement profile
exports.addMeasurementProfile = async (req, res) => {
    const userId = req.params.id;
    const { title, type, measurements } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'User not found or not a customer' });
        }

        // Ensure customerProfile and measurementProfiles array exist
        if (!user.customerProfile) user.customerProfile = {};
        if (!user.customerProfile.measurementProfiles) user.customerProfile.measurementProfiles = [];

        if (user.customerProfile.measurementProfiles.length >= 12) {
            return res.status(400).json({ message: 'Cannot add more than 12 measurement profiles' });
        }

        const newProfile = {
            title,
            type,
            measurements: typeof measurements === 'object' ? measurements : {}

        };

        user.customerProfile.measurementProfiles.push(newProfile);
        await user.save();

        res.status(200).json({
            message: 'Measurement profile added successfully',
            data: user.customerProfile.measurementProfiles
        });
    } catch (err) {
        res.status(500).json({ message: 'Error adding measurement profile', error: err });
    }
};

// Update a specific measurement profile
exports.updateMeasurementProfile = async (req, res) => {
    const userId = req.params.id;
    const profileId = req.params.profileId;
    const { title, type, measurements } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'User not found or not a customer' });
        }

        // Ensure customerProfile and measurementProfiles array exist
        if (!user.customerProfile) user.customerProfile = {};
        if (!user.customerProfile.measurementProfiles) user.customerProfile.measurementProfiles = [];

        const profile = user.customerProfile.measurementProfiles.id(profileId);
        if (!profile) {
            return res.status(404).json({ message: 'Measurement profile not found' });
        }

        if (title) profile.title = title;
        if (type) profile.type = type;
        if (measurements) profile.measurements = measurements;
        
          


        await user.save();

        res.status(200).json({
            message: 'Measurement profile updated successfully',
            data: profile
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating measurement profile', error: err });
    }
};


// DELETE a measurement profile
exports.deleteMeasurementProfile = async (req, res) => {
  const userId = req.params.id;
  const profileId = req.params.profileId;

  try {
    // Step 1: Find the user
    const user = await User.findById(userId);
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ message: 'User not found or not a customer' });
    }

    // Step 2: Check for customerProfile and measurementProfiles
    if (!user.customerProfile || !user.customerProfile.measurementProfiles) {
      return res.status(404).json({ message: 'Customer profile or measurement profiles not found' });
    }

    // Step 3: Find the index of the measurement profile
    const index = user.customerProfile.measurementProfiles.findIndex(
      (profile) => profile._id && profile._id.toString() === profileId
    );
    if (index === -1) {
      return res.status(404).json({ message: 'Measurement profile not found' });
    }

    // Step 4: Remove the measurement profile using splice
    user.customerProfile.measurementProfiles.splice(index, 1);

    // Step 5: Save the updated user
    await user.save();

    return res.status(200).json({ message: 'Measurement profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting measurement profile:', err);
    return res.status(500).json({ message: 'Error deleting measurement profile', error: err.message });
  }
};

  
  // Get all measurement profiles
  exports.getMeasurementProfiles = async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ message: 'User not found or not a customer' });
      }
  
      res.status(200).json({
        message: 'Measurement profiles fetched successfully',
        data: user.customerProfile?.measurementProfiles || []
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching measurement profiles', error: err });
    }
  };
  

// PATCH /user/update-rating/:id
exports.updateTailorRating = async (req, res) => {
    const tailorId = req.params.id;
    const { rating } = req.body;
  
    try {
      const user = await User.findById(tailorId);
      if (!user || user.role !== 'tailor') {
        return res.status(404).json({ message: 'Tailor not found' });
      }
  
      user.shopDetails.ratings = rating; // Assuming tailor ratings are stored in shopDetails
      await user.save();
  
      res.status(200).json({ message: 'Tailor rating updated', rating });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update tailor rating', error: err.message });
    }
  };

// Get user by ID (generic, for any role)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};
  

  