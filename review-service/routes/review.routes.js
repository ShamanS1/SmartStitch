const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/:userid', verifyToken, reviewController.createReview);
router.get('/', reviewController.getReviews);
router.patch('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
