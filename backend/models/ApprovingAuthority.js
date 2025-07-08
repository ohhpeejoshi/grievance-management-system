import { db } from '../config/db.js';

export const getApprovingAuthorityByEmail = (email, callback) => {
    const sql = `
    SELECT
      id, name, email, password, mobile_number, role
    FROM approving_authorities
    WHERE email = ?
  `;
    db.query(sql, [email], callback);
};

export const createApprovingAuthority = (data, callback) => {
    const { name, email, hashedPassword, mobile_number, role } = data;
    const sql = `
    INSERT INTO approving_authorities
      (name, email, password, mobile_number, role)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(
        sql,
        [name, email, hashedPassword, mobile_number, role],
        callback
    );
};
