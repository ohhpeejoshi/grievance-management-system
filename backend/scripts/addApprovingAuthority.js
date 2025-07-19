import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

dotenv.config();

(async () => {
    try {
        const name = 'Approving Authority';
        const email = 'authority@lnmiit.ac.in';
        const plainPassword = '123456789';
        const mobile_number = '7357222550';
        const role = 'Approving Authority';

        const hashedPassword = await bcrypt.hash(plainPassword, 6);

        const sql = `
      INSERT INTO approving_authorities
        (name, email, password, mobile_number, role)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.query(
            sql,
            [name, email, hashedPassword, mobile_number, role],
            (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    process.exit(1);
                }
                console.log('Approving Authority added with ID:', result.insertId);
                process.exit(0);
            }
        );
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
