// /backend/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    verifyOtp,
    forgotPassword,
    resetPassword,
    getUserProfile,
    officeBearerLogin,
    officeBearerVerifyOtp,
    approvingAuthorityLogin,
    approvingAuthorityVerifyOtp,
    adminLogin,
    adminVerifyOtp
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ← New profile endpoint
router.get('/profile', getUserProfile);
router.post('/office-bearer-login', officeBearerLogin);
router.post('/office-bearer-verify-otp', officeBearerVerifyOtp);
router.post(
    '/approving-authority-login',
    approvingAuthorityLogin
);
router.post(
    '/approving-authority-verify-otp',
    approvingAuthorityVerifyOtp
);
router.post('/admin-login', adminLogin);
router.post('/admin-verify-otp', adminVerifyOtp);
export default router;
