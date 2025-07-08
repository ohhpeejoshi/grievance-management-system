import { db } from '../config/db.js';

export const getOfficeBearerByEmail = (email, callback) => {
    const query = `
    SELECT
      id,
      name,
      email,
      password,
      mobile_number,
      role,
      department
    FROM office_bearers
    WHERE email = ?
  `;
    db.query(query, [email], callback);
};

export const createOfficeBearer = (bearerData, callback) => {
    const { name, email, hashedPassword, mobile_number, role, department } = bearerData;
    const query = `
    INSERT INTO office_bearers
      (name, email, password, mobile_number, role, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(query, [name, email, hashedPassword, mobile_number, role, department], callback);
};

// …and similarly wrap the other UPDATE/SELECTs in back-ticks…
