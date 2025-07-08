// backend/scripts/addOfficeBearer.js
// Script to insert a predefined office bearer into the database

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

dotenv.config();

(async () => {
    try {
        // Hardcoded credentials
        const name = 'Office Bearer';
        const email = 'officebearer.ac.in';
        const plainPassword = '123456789';
        const mobile_number = '7906726971';
        const role = 'Office Bearer';
        const department = 'IT';

        // Hash the plain text password
        const saltRounds = 6;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Insert into office_bearers table
        const query = `
      INSERT INTO office_bearers
        (name, email, password, mobile_number, role, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        db.query(
            query,
            [name, email, hashedPassword, mobile_number, role, department],
            (err, result) => {
                if (err) {
                    console.error('Database insertion error:', err);
                    process.exit(1);
                }
                console.log('Office bearer added with ID:', result.insertId);
                process.exit(0);
            }
        );
    } catch (err) {
        console.error('Error hashing password or inserting:', err);
        process.exit(1);
    }
})();
