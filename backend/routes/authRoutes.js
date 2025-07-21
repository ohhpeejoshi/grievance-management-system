// /backend/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    login,
    verifyOtp,
    forgotPassword,
    resetPassword,
    getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ← New profile endpoint
router.get('/profile', protect, getUserProfile);
export default router;