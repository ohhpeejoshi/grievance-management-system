import bcrypt from 'bcrypt';
import { createUser } from '../models/User.js';
import { db } from '../config/db.js'
import { sendOtpEmail } from '../utils/sendOtp.js';

export const registerUser = (req, res) => {
    const { roll_number, name, email, password, mobile_number } = req.body;

    if (!email.endsWith('@lnmiit.ac.in')) {
        return res.status(400).json({ error: 'Only LNMIIT emails are allowed.' });
    }

    bcrypt.hash(password, 6, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Password encryption failed.' });

        const userData = { roll_number, name, email, hashedPassword, mobile_number };

        createUser(userData, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error.' });
            }
            return res.status(201).json({ message: 'User registered successfully.' });
        });
    });
};

const otpStore = new Map();
export const loginUser = (req, res) => {
    const { email, password, mobile_number } = req.body;

    // 1. Check if user exists
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(400).json({ error: "Email not registered" });

        const user = results[0];

        // 2. Validate password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ error: "Incorrect password" });

        // 3. Validate mobile number
        if (user.mobile_number !== mobile_number)
            return res.status(400).json({ error: "Incorrect mobile number" });

        // 4. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);

        console.log(`OTP for ${email}: ${otp}`);
        //send email otp
        try {
            await sendOtpEmail(email, otp);
            return res.status(200).json({ message: "OTP sent to email", email });
        } catch (err) {
            return res.status(500).json({ error: "Failed to send OTP email" });
        }

    });
};

export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otpStore.get(email);

    if (!storedOtp) return res.status(400).json({ error: "OTP expired or not found" });
    if (storedOtp !== otp) return res.status(400).json({ error: "Incorrect OTP" });

    // Optional: Remove OTP after use
    otpStore.delete(email);

    res.status(200).json({ message: "Login successful" });
};