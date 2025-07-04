// /backend/models/Grievance.js
import { db } from '../config/db.js';

export const getAllDepartments = (callback) => {
    db.query('SELECT id, name FROM departments ORDER BY name', callback);
};

export const getCategoriesByDept = (deptId, callback) => {
    // now also SELECT urgency so frontend can auto-display it
    const sql = `
      SELECT id, name, urgency
      FROM categories
      WHERE department_id = ?
      ORDER BY name
    `;
    db.query(sql, [deptId], callback);
};

export const createGrievance = (data, callback) => {
    const {
        title,
        description,
        location,
        department_id,
        category_id,
        urgency,
        attachmentPath,
        mobile_number,
        complainant_name,
        email
    } = data;

    const query = `
    INSERT INTO grievances
      (title, description, location, department_id, category_id, urgency,
       attachment, mobile_number, complainant_name, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db.query(
        query,
        [
            title,
            description,
            location,
            department_id,
            category_id,
            urgency,
            attachmentPath,
            mobile_number,
            complainant_name,
            email
        ],
        callback
    );
};
