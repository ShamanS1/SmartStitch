const axios = require('axios');
const Review = require('../models/Review');
// const { getUserById } = require('../utils/userService');

const AUTH_SERVICE_URL = 'http://localhost:5000/api/auth';
const TAILOR_SERVICE_URL = 'http://localhost:5001/api/tailors';

// Utility: Calculate average rating
async function calculateAvgRating(filter) {
  const reviews = await Review.find(filter);
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  return avg.toFixed(1);
}

// 1. CREATE Review
exports.createReview = async (req, res) => {
  const { rating, comment, tailorId, dressStyleId } = req.body;
  const customerId = req.params.userid;
  const role = req.user.role;

  if (role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can create reviews.' });
  }

  // Add this validation
  if (rating === undefined || rating === null) {
    return res.status(400).json({ message: 'Rating is required.' });
  }

  try {
    const existing = await Review.findOne({ customerId, tailorId, dressStyleId });
    if (existing) {
      return res.status(400).json({ message: 'Review already exists.' });
    }

    const newReview = new Review({ customerId, tailorId, dressStyleId, rating, comment });
    await newReview.save();

    // Update ratings via Axios
    if (tailorId) {
      const avgTailorRating = await calculateAvgRating({ tailorId });
      await axios.patch(`${AUTH_SERVICE_URL}/update-rating/${tailorId}`, {
        rating: avgTailorRating,
      });
    }

    if (dressStyleId) {
      const avgDressRating = await calculateAvgRating({ dressStyleId });
      await axios.patch(`${TAILOR_SERVICE_URL}/dress-style/update-rating/${dressStyleId}`, {
        rating: avgDressRating,
      });
    }

    res.status(201).json({ message: 'Review created', review: newReview });
  } catch (err) {
    res.status(500).json({ message: 'Create review failed', error: err.message });
  }
};

// 2. GET reviews by tailorId or dressStyleId
exports.getReviews = async (req, res) => {
  const { tailorId, dressStyleId } = req.query;
  try {
    const filter = {};
    if (tailorId) filter.tailorId = tailorId;
    if (dressStyleId) filter.dressStyleId = dressStyleId;

    const reviews = await Review.find(filter);
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

// 3. UPDATE review
exports.updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;
  const customerId = req.user.userId;
  const role = req.user.role;
  

  if (role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can update reviews.' });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.customerId.toString() !== customerId) {
      return res.status(403).json({ message: `Unauthorized to update this review.${customerId}`,role});
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    // Update ratings
    if (review.tailorId) {
      const avgTailorRating = await calculateAvgRating({ tailorId: review.tailorId });
      await axios.patch(`${AUTH_SERVICE_URL}/user/update-rating/${review.tailorId}`, {
        rating: avgTailorRating,
      });
    }
    if (review.dressStyleId) {
      const avgDressRating = await calculateAvgRating({ dressStyleId: review.dressStyleId });
      await axios.patch(`${TAILOR_SERVICE_URL}/dress-style/update-rating/${review.dressStyleId}`, {
        rating: avgDressRating,
      });
    }

    res.status(200).json({ message: 'Review updated', review });
  } catch (err) {
    res.status(500).json({ message: 'Update review failed', error: err.message });
  }
};

// 4. DELETE review
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const customerId = req.user.id;
  const role = req.user.role;

  if (role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can delete reviews.' });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.customerId.toString() !== customerId) {
      return res.status(403).json({ message: 'Unauthorized to delete this review.' });
    }

    const { tailorId, dressStyleId } = review;
    await review.deleteOne();

    // Update ratings
    if (tailorId) {
      const avgTailorRating = await calculateAvgRating({ tailorId });
      await axios.patch(`${AUTH_SERVICE_URL}/user/update-rating/${tailorId}`, {
        rating: avgTailorRating,
      });
    }
    if (dressStyleId) {
      const avgDressRating = await calculateAvgRating({ dressStyleId });
      await axios.patch(`${TAILOR_SERVICE_URL}/dress-style/update-rating/${dressStyleId}`, {
        rating: avgDressRating,
      });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete review failed', error: err.message });
  }
};
