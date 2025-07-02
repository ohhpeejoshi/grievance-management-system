import bcrypt from 'bcrypt';
import { createUser } from '../models/User.js';

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
