import { db } from '../config/db.js';

/**
 * Get all workers for a specific department
 * @param {number} departmentId - The ID of the department
 * @param {function} callback - The callback function
 */
export const getWorkersByDepartment = (departmentId, callback) => {
    const sql = 'SELECT * FROM workers WHERE department_id = ?';
    db.query(sql, [departmentId], callback);
};

/**
 * Create a new worker
 * @param {object} workerData - The data for the new worker
 * @param {function} callback - The callback function
 */
export const createWorker = (workerData, callback) => {
    const { name, email, phone_number, department_id } = workerData;
    const sql = 'INSERT INTO workers (name, email, phone_number, department_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone_number, department_id], callback);
};
