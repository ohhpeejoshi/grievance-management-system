// /backend/models/User.js
import { db } from '../config/db.js';

export const createUser = (userData, callback) => {
    const { roll_number, name, email, hashedPassword, mobile_number } = userData;
    const query = `
    INSERT INTO users
      (roll_number, name, email, password, mobile_number)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(query, [roll_number, name, email, hashedPassword, mobile_number], callback);
};

export const updateUserPassword = (email, newHashedPassword, callback) => {
    const query = `UPDATE users SET password = ? WHERE email = ?`;
    db.query(query, [newHashedPassword, email], callback);
};

/**
 * Fetch a full user record (name, email, mobile_number) by email
 */
export const getUserByEmail = (email, callback) => {
    const query = `
    SELECT name, email, mobile_number
    FROM users
    WHERE email = ?
  `;
    db.query(query, [email], callback);
};
