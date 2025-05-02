import express from 'express';
import { forwardToAuth, forwardToStore, forwardToTailor } from '../controllers/gateway.controller.js';

const router = express.Router();

// Auth service routes
router.use('/auth', forwardToAuth);

// Store service routes
router.use('/store', forwardToStore);

// Tailor service routes
router.use('/tailors', forwardToTailor);

export default router;

