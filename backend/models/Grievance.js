// backend/models/Grievance.js
import { db } from '../config/db.js';

export const getAllDepartments = (callback) => {
  db.query('SELECT id, name FROM departments ORDER BY name', callback);
};

export const getCategoriesByDept = (deptId, callback) => {
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
    email,
    ticket_id
  } = data;

  const query = `
    INSERT INTO grievances
      (ticket_id, title, description, location,
       department_id, category_id, urgency,
       attachment, mobile_number,
       complainant_name, email, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
  `;

  db.query(
    query,
    [
      ticket_id,
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


export const getGrievancesByDepartment = (departmentId, callback) => {
  // THE FIX: Added a JOIN with the 'users' table to fetch the 'roll_number'
  const query = `
    SELECT g.*, c.name as category_name, u.roll_number
    FROM grievances g
    JOIN categories c ON g.category_id = c.id
    LEFT JOIN users u ON g.email = u.email
    WHERE g.department_id = ?
    ORDER BY g.created_at DESC
  `;
  db.query(query, [departmentId], callback);
};

export const updateGrievanceStatus = (ticketId, status, workerId, callback) => {
  let sql;
  let params;

  if (workerId) {
    sql = 'UPDATE grievances SET status = ?, assigned_worker_id = ? WHERE ticket_id = ?';
    params = [status, workerId, ticketId];
  } else {
    sql = 'UPDATE grievances SET status = ? WHERE ticket_id = ?';
    params = [status, ticketId];
  }

  db.query(sql, params, callback);
};

export const getGrievanceDetails = (ticketId, callback) => {
  const sql = `
        SELECT 
            g.*, 
            c.name AS category_name,
            d.name AS department_name,
            w.name AS worker_name,
            w.email AS worker_email,
            w.phone_number AS worker_phone
        FROM grievances g
        LEFT JOIN categories c ON g.category_id = c.id
        LEFT JOIN departments d ON g.department_id = d.id
        LEFT JOIN workers w ON g.assigned_worker_id = w.id
        WHERE g.ticket_id = ?
    `;
  db.query(sql, [ticketId], callback);
};
