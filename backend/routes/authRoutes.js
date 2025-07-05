// /backend/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    verifyOtp,
    forgotPassword,
    resetPassword,
    getUserProfile
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ← New profile endpoint
router.get('/profile', getUserProfile);

export default router;
