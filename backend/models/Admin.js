import { db } from '../config/db.js';

export const getAdminByEmail = (email, cb) => {
    const sql = `
    SELECT id, name, email, password, mobile_number, role
    FROM admins
    WHERE email = ?
  `;
    db.query(sql, [email], cb);
};

export const createAdmin = (data, cb) => {
    const { name, email, hashedPassword, mobile_number, role } = data;
    const sql = `
    INSERT INTO admins (name, email, password, mobile_number, role)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(sql, [name, email, hashedPassword, mobile_number, role], cb);
};