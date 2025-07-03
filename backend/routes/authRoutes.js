import express from 'express';
import {
    registerUser,
    loginUser,
    verifyOtp,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);

// ← NEW
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
