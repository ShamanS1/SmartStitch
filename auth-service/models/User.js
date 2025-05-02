const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Tailor shop details schema
const shopDetailsSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  services: [String], // List of services offered by the tailor
  pickupAvailable: { type: Boolean, default: false },
  deliveryAvailable: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  shopStatus: { type: String, enum: ['open', 'close'], default: 'close' },
});

// Customer measurement profile schema
const measurementSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Shirt 1", "Pant Fit"
  type: { type: String, enum: ['shirt', 'pant', 'suit', 'lehenga', 'custom'], required: true },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    shoulder: Number,
    sleeve: Number,
    length: Number,
    inseam: Number,
    neck: Number,
    // Add more as per need
  }
}, { _id: true });

// Customer-specific profile schema
const customerProfileSchema = new mongoose.Schema({
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  measurementProfiles: {
    type: [measurementSchema],
    validate: [val => val.length <= 12, 'You can only have up to 12 measurement profiles.']
  }
});

// Main User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'tailor', 'admin'], default: 'customer' },

  shopDetails: {
    type: shopDetailsSchema,
    required: function () { return this.role === 'tailor'; },
    default: null
  },

  customerProfile: {
    type: customerProfileSchema,
    required: function () { return this.role === 'customer'; },
    default: null
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
