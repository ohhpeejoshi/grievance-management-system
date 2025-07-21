import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, updateUserPassword, getUserByEmail } from '../models/User.js';
import { db } from '../config/db.js';
import { sendOtpEmail } from '../utils/sendOtp.js';
import { getOfficeBearerByEmail } from '../models/OfficeBearer.js';
import { getApprovingAuthorityByEmail } from '../models/ApprovingAuthority.js';
import { sendRegistrationEmail } from '../utils/mail.js';
import { getAdminByEmail } from '../models/Admin.js';
import ErrorResponse from '../utils/errorResponse.js';
const otpStore = new Map();

const generateToken = (email, role) => {
    return jwt.sign({ email, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

export const registerUser = async (req, res, next) => {
    const { roll_number, name, email, password, mobile_number } = req.body;
    if (!email.endsWith('@lnmiit.ac.in') && email !== 'grievanceportallnmiit@gmail.com') {
        return next(new ErrorResponse('Only LNMIIT emails are allowed.', 400));
    }

    try {
        const queries = [
            db.promise().query('SELECT email FROM users WHERE email = ?', [email]),
            db.promise().query('SELECT email FROM office_bearers WHERE email = ?', [email]),
            db.promise().query('SELECT email FROM approving_authorities WHERE email = ?', [email]),
            db.promise().query('SELECT email FROM admins WHERE email = ?', [email])
        ];

        const results = await Promise.all(queries);
        const emailExists = results.some(result => result[0].length > 0);

        if (emailExists) {
            return next(new ErrorResponse('Email is already registered.', 400));
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        createUser({ roll_number, name, email, hashedPassword, mobile_number }, async (err) => {
            if (err) {
                return next(new ErrorResponse('Database error during user creation.', 500));
            }

            sendRegistrationEmail(email, name)
                .catch(console.error);

            res.status(201).json({ message: 'User registered successfully.' });
        });
    } catch (error) {
        next(error)
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const a = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        const b = await db.promise().query('SELECT * FROM office_bearers WHERE email = ?', [email]);
        const c = await db.promise().query('SELECT * FROM approving_authorities WHERE email = ?', [email]);
        const d = await db.promise().query('SELECT * FROM admins WHERE email = ?', [email]);

        const user = a[0][0] || b[0][0] || c[0][0] || d[0][0];

        if (!user) {
            return next(new ErrorResponse('Email not registered', 400));
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return next(new ErrorResponse('Incorrect password', 400));

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(user.email, { otp: otp, createdAt: Date.now() });
        console.log(`OTP for login (${user.email}):`, otp);

        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: 'OTP sent to email', email: user.email });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = (req, res, next) => {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp) {
        return next(new ErrorResponse('Incorrect OTP', 400));
    }

    const isExpired = (Date.now() - storedData.createdAt) > 60000; // 60 seconds
    if (isExpired) {
        otpStore.delete(email);
        return next(new ErrorResponse('OTP has expired. Please request a new one.', 400));
    }

    otpStore.delete(email);

    const userQuery = db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const bearerQuery = db.promise().query('SELECT * FROM office_bearers WHERE email = ?', [email]);
    const authorityQuery = db.promise().query('SELECT * FROM approving_authorities WHERE email = ?', [email]);
    const adminQuery = db.promise().query('SELECT * FROM admins WHERE email = ?', [email]);

    Promise.all([userQuery, bearerQuery, authorityQuery, adminQuery]).then(async ([userResults, bearerResults, authorityResults, adminResults]) => {
        const user = userResults[0][0];
        const bearer = bearerResults[0][0];
        const authority = authorityResults[0][0];
        const admin = adminResults[0][0];

        let role;
        let departmentId;
        if (user) {
            role = 'user';
        } else if (bearer) {
            role = 'office-bearer';
            try {
                const [deptRows] = await db.promise().query('SELECT id FROM departments WHERE name = ?', [bearer.department]);
                if (!deptRows.length) {
                    return next(new ErrorResponse('Office bearer department not found.', 400));
                }
                departmentId = deptRows[0].id;
            } catch (dbError) {
                return next(new ErrorResponse('Database error fetching department ID.', 500));
            }
        } else if (authority) {
            role = 'approving-authority';
        } else if (admin) {
            role = 'admin';
        } else {
            return next(new ErrorResponse('User not found after OTP verification', 400));
        }

        const token = generateToken(email, role);
        res.status(200).json({
            message: 'Login successful',
            token,
            role,
            departmentId
        });

    }).catch(err => {
        console.error("Verify OTP error:", err);
        return next(new ErrorResponse("Server error during user role verification.", 500));
    });
};


export const forgotPassword = async (req, res, next) => {
    const { identifier } = req.body;

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
            return next(new ErrorResponse('Email not found in any user role.', 404));
        }

        const email = foundUser.email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, { otp: otp, purpose: 'reset', createdAt: Date.now() });
        console.log(`OTP for password reset (${email}):`, otp);

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP has been sent to your registered email.' });

    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    const { identifier, otp, newPassword } = req.body;
    const email = identifier;

    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp || storedData.purpose !== 'reset') {
        return next(new ErrorResponse('Invalid OTP or request.', 400));
    }

    const isExpired = (Date.now() - storedData.createdAt) > 60000;
    if (isExpired) {
        otpStore.delete(email);
        return next(new ErrorResponse('OTP has expired. Please request a new one.', 400));
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
            next(new ErrorResponse('User not found during password update.', 404));
        }
    } catch (err) {
        next(err);
    }
};

export const getUserProfile = (req, res, next) => {
    // The 'protect' middleware adds the user payload to req.user
    const email = req.user.email;

    if (!email) {
        return next(new ErrorResponse('User not found from token', 404));
    }

    getUserByEmail(email, (err, results) => {
        if (err) {
            return next(new ErrorResponse('Database error', 500));
        }
        if (!results.length) {
            return next(new ErrorResponse('User not found', 404));
        }
        const { name, email: userEmail, mobile_number } = results[0];
        res.json({ name, email: userEmail, mobileNumber: mobile_number });
    });
};