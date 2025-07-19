import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

dotenv.config();

(async () => {
    try {
        const name = 'Admin';
        const email = 'admin@lnmiit.ac.in';
        const plainPassword = '123456789';
        const mobile_number = '7357222550';
        const role = 'Admin';

        const hashedPassword = await bcrypt.hash(plainPassword, 6);
        const sql = `INSERT INTO admins
      (name,email,password,mobile_number,role)
      VALUES (?,?,?,?,?)`;

        db.query(sql,
            [name, email, hashedPassword, mobile_number, role],
            (err, result) => {
                if (err) { console.error(err); process.exit(1); }
                console.log('Admin added ID:', result.insertId);
                process.exit(0);
            }
        );
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();