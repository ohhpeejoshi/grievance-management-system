import bcrypt from 'bcrypt';
import { createUser, updateUserPassword, getUserByEmail } from '../models/User.js';
import { db } from '../config/db.js';
import { sendOtpEmail } from '../utils/sendOtp.js';

const otpStore = new Map();

export const registerUser = (req, res) => {
    const { roll_number, name, email, password, mobile_number } = req.body;
    if (!email.endsWith('@lnmiit.ac.in')) {
        return res.status(400).json({ error: 'Only LNMIIT emails are allowed.' });
    }
    bcrypt.hash(password, 6, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Password encryption failed.' });
        createUser({ roll_number, name, email, hashedPassword, mobile_number }, (err2) => {
            if (err2) return res.status(500).json({ error: 'Database error.' });
            res.status(201).json({ message: 'User registered successfully.' });
        });
    });
};

export const loginUser = (req, res) => {
    const { email, password, mobile_number } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(400).json({ error: 'Email not registered' });
        const user = results[0];
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ error: 'Incorrect password' });
        if (user.mobile_number !== mobile_number)
            return res.status(400).json({ error: 'Incorrect mobile number' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(user.email, otp);
        console.log(`OTP for login (${user.email}):`, otp);

        try {
            await sendOtpEmail(user.email, otp);
            res.status(200).json({ message: 'OTP sent to email', email: user.email });
        } catch {
            res.status(500).json({ error: 'Failed to send OTP email' });
        }
    });
};

export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ error: 'OTP expired or not found' });
    if (stored !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
    otpStore.delete(email);
    res.status(200).json({ message: 'Login successful' });
};

export const forgotPassword = (req, res) => {
    const { identifier } = req.body;
    const query = 'SELECT email FROM users WHERE email = ? OR mobile_number = ?';
    db.query(query, [identifier, identifier], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(400).json({ error: 'Identifier not found' });

        const email = results[0].email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);
        console.log(`OTP for reset (${email}):`, otp);

        try {
            await sendOtpEmail(email, otp);
            res.status(200).json({ message: 'OTP has been sent to your email.' });
        } catch {
            res.status(500).json({ error: 'Failed to send OTP email' });
        }
    });
};

export const resetPassword = (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    const query = 'SELECT email FROM users WHERE email = ? OR mobile_number = ?';
    db.query(query, [identifier, identifier], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(400).json({ error: 'Identifier not found' });

        const email = results[0].email;
        const stored = otpStore.get(email);
        if (!stored) return res.status(400).json({ error: 'OTP expired or not found' });
        if (stored !== otp) return res.status(400).json({ error: 'Incorrect OTP' });

        bcrypt.hash(newPassword, 6, (err2, hashed) => {
            if (err2) return res.status(500).json({ error: 'Encryption failed.' });
            updateUserPassword(email, hashed, (err3) => {
                if (err3) return res.status(500).json({ error: 'DB error updating password' });
                otpStore.delete(email);
                res.status(200).json({ message: 'Password has been reset successfully.' });
            });
        });
    });
};

/**
 * GET /api/auth/profile?email=...
 */
export const getUserProfile = (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    getUserByEmail(email, (err, results) => {
        if (err) {
            console.error('DB error fetching user profile:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { name, email: userEmail, mobile_number } = results[0];
        res.json({ name, email: userEmail, mobileNumber: mobile_number });
    });
};
