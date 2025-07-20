import bcrypt from 'bcrypt';
import { createUser, updateUserPassword, getUserByEmail } from '../models/User.js';
import { db } from '../config/db.js';
import { sendOtpEmail } from '../utils/sendOtp.js';
import { getOfficeBearerByEmail } from '../models/OfficeBearer.js';
import { getApprovingAuthorityByEmail } from '../models/ApprovingAuthority.js';
import { sendRegistrationEmail } from '../utils/mail.js';
import { getAdminByEmail } from '../models/Admin.js';
const otpStore = new Map();

export const registerUser = (req, res) => {
    const { roll_number, name, email, password, mobile_number } = req.body;
    if (!email.endsWith('@lnmiit.ac.in') && email !== 'grievanceportallnmiit@gmail.com') {
        return res.status(400).json({ error: 'Only LNMIIT emails are allowed.' });
    }

    bcrypt.hash(password, 6, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Password encryption failed.' });
        createUser({ roll_number, name, email, hashedPassword, mobile_number }, async (err2) => {
            if (err2) return res.status(500).json({ error: 'Database error.' });

            sendRegistrationEmail(email, name)
                .catch(console.error);

            res.status(201).json({ message: 'User registered successfully.' });
        });
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const a = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const b = await db.promise().query('SELECT * FROM office_bearers WHERE email = ?', [email]);
    const c = await db.promise().query('SELECT * FROM approving_authorities WHERE email = ?', [email]);
    const d = await db.promise().query('SELECT * FROM admins WHERE email = ?', [email]);

    const user = a[0][0] || b[0][0] || c[0][0] || d[0][0];

    if (!user) {
        return res.status(400).json({ error: 'Email not registered' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Incorrect password' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(user.email, { otp: otp, createdAt: Date.now() });
    console.log(`OTP for login (${user.email}):`, otp);

    try {
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email', email: user.email });
    } catch {
        res.status(500).json({ error: 'Failed to send OTP email' });
    }
};

export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({ error: 'Incorrect OTP' });
    }

    const isExpired = (Date.now() - storedData.createdAt) > 60000; // 60 seconds
    if (isExpired) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    otpStore.delete(email); // OTP is used, so delete it.

    const a = db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const b = db.promise().query('SELECT * FROM office_bearers WHERE email = ?', [email]);
    const c = db.promise().query('SELECT * FROM approving_authorities WHERE email = ?', [email]);
    const d = db.promise().query('SELECT * FROM admins WHERE email = ?', [email]);

    Promise.all([a, b, c, d]).then((results) => {
        if (results[0][0][0]) {
            res.status(200).json({ message: 'Login successful', role: 'user' });
        } else if (results[1][0][0]) {
            res.status(200).json({ message: 'Login successful', role: 'office-bearer', departmentId: results[1][0][0].department_id });
        } else if (results[2][0][0]) {
            res.status(200).json({ message: 'Login successful', role: 'approving-authority' });
        } else if (results[3][0][0]) {
            res.status(200).json({ message: 'Login successful', role: 'admin' });
        } else {
            res.status(400).json({ error: 'User not found after OTP verification' });
        }
    });
};


export const forgotPassword = async (req, res) => {
    const { identifier } = req.body; // Identifier is the email

    const queries = [
        db.promise().query('SELECT email FROM users WHERE email = ?', [identifier]),
        db.promise().query('SELECT email FROM office_bearers WHERE email = ?', [identifier]),
        db.promise().query('SELECT email FROM approving_authorities WHERE email = ?', [identifier]),
        db.promise().query('SELECT email FROM admins WHERE email = ?', [identifier])
    ];

    try {
        const results = await Promise.all(queries);
        const foundUser = results.map(r => r[0][0]).find(user => user);

        if (!foundUser) {
            return res.status(404).json({ error: 'Email not found in any user role.' });
        }

        const email = foundUser.email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, { otp: otp, purpose: 'reset', createdAt: Date.now() });
        console.log(`OTP for password reset (${email}):`, otp);

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP has been sent to your registered email.' });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ error: 'Database error or failed to send OTP.' });
    }
};

export const resetPassword = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    const email = identifier;

    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp || storedData.purpose !== 'reset') {
        return res.status(400).json({ error: 'Invalid OTP or request.' });
    }

    const isExpired = (Date.now() - storedData.createdAt) > 60000; // 60 seconds
    if (isExpired) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 6);

        const tables = ['users', 'office_bearers', 'approving_authorities', 'admins'];
        let passwordUpdated = false;

        for (const table of tables) {
            const [results] = await db.promise().query(`SELECT id FROM ${table} WHERE email = ?`, [email]);
            if (results.length > 0) {
                await db.promise().query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);
                passwordUpdated = true;
                break;
            }
        }

        if (passwordUpdated) {
            otpStore.delete(email);
            res.status(200).json({ message: 'Password has been reset successfully.' });
        } else {
            res.status(404).json({ error: 'User not found during password update.' });
        }
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ error: 'Failed to reset password due to a server error.' });
    }
};


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