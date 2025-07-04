// /backend/controllers/grievanceController.js
import fs from 'fs';
import path from 'path';
import { getAllDepartments, getCategoriesByDept, createGrievance } from '../models/Grievance.js';

/**
 * GET /api/grievances/departments
 */
export const listDepartments = (req, res) => {
    getAllDepartments((err, results) => {
        if (err) {
            console.error('DB error fetching departments:', err);
            return res.status(500).json({ error: 'DB error fetching departments' });
        }
        res.json(results);
    });
};

/**
 * GET /api/grievances/categories/:deptId
 */
export const listCategories = (req, res) => {
    const deptId = req.params.deptId;
    getCategoriesByDept(deptId, (err, results) => {
        if (err) {
            console.error('DB error fetching categories:', err);
            return res.status(500).json({ error: 'DB error fetching categories' });
        }
        res.json(results);
    });
};

/**
 * POST /api/grievances/submit
 */
export const submitGrievance = (req, res) => {
    // multer saved file info in req.file
    const attachmentPath = req.file ? req.file.filename : null;

    const {
        title,
        description,
        location,
        department,     // deptId string
        category,       // catId string
        urgency = 'Normal',
        mobileNumber,
        complainantName,
        email
    } = req.body;

    // parse ids
    const department_id = parseInt(department, 10);
    const category_id = parseInt(category, 10);

    // insert
    createGrievance(
        {
            title,
            description,
            location,
            department_id,
            category_id,
            urgency,
            attachmentPath,
            mobile_number: mobileNumber,
            complainant_name: complainantName,
            email
        },
        (err) => {
            if (err) {
                console.error('DB error inserting grievance:', err);
                return res.status(500).json({ error: 'DB error inserting grievance' });
            }
            res.status(201).json({ message: 'Grievance submitted successfully' });
        }
    );
};
