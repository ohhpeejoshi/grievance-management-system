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

/**
 * Inserts a grievance into the database
 * @param {Object} data - grievance form data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.location
 * @param {number} data.department_id
 * @param {number} data.category_id
 * @param {string} data.urgency
 * @param {string|null} data.attachmentPath - ImageKit uploaded file URL
 * @param {string} data.mobile_number
 * @param {string} data.complainant_name
 * @param {string} data.email
 * @param {Function} callback - callback(error, result)
 */
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
        email,
        ticket_id
    } = data;

    const query = `
        INSERT INTO grievances
          (ticket_id, title, description, location, department_id, category_id, urgency,
           attachment, mobile_number, complainant_name, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            ticket_id, // ✅ ticket_id right after id
            title,
            description,
            location,
            department_id,
            category_id,
            urgency,
            attachmentPath || null,
            mobile_number,
            complainant_name,
            email
        ],
        callback
    );
};
