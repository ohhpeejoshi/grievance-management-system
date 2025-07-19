import {
    getAllDepartments,
    getCategoriesByDept,
    createGrievance,
    getGrievancesByDepartment as getGrievancesByDepartmentFromModel
} from '../models/Grievance.js';
import { getWorkersByDepartment, createWorker } from '../models/Worker.js';
import {
    sendGrievanceStatusUpdateEmail,
    sendGrievanceAssignedEmailToUser,
    sendGrievanceAssignedEmailToWorker
} from '../utils/mail.js';
import imagekit from '../config/imagekit.js';
import { db } from '../config/db.js';

export const listDepartments = (req, res) => {
    getAllDepartments((err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching departments' });
        res.json(results);
    });
};

export const listCategories = (req, res) => {
    const deptId = req.params.deptId;
    getCategoriesByDept(deptId, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching categories' });
        res.json(results);
    });
};

export const submitGrievance = async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file && req.file.buffer) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,
                fileName: `grievance_${Date.now()}_${req.file.originalname}`,
                folder: "/grievances",
            });
            imageUrl = uploadResponse.url;
        }

        const { title, description, location, department, category, urgency = 'Normal', mobileNumber, complainantName, email } = req.body;
        const department_id = parseInt(department, 10);
        const category_id = parseInt(category, 10);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const [rows] = await db.promise().query(`SELECT COUNT(*) AS count FROM grievances WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`, [month, year]);
        const serialNo = String(rows[0].count + 1).padStart(4, '0');
        const ticket_id = `lnm/${year}/${month}/${serialNo}`;

        createGrievance({ title, description, location, department_id, category_id, urgency, attachmentPath: imageUrl, mobile_number: mobileNumber, complainant_name: complainantName, email, ticket_id }, (err) => {
            if (err) return res.status(500).json({ error: 'DB error inserting grievance' });
            res.status(201).json({ message: 'Grievance submitted successfully', ticket_id });
        });
    } catch (err) {
        console.error('Grievance submission failed:', err);
        res.status(500).json({ error: 'Grievance submission failed' });
    }
};

export const trackGrievance = async (req, res) => {
    try {
        const { ticket_id } = req.params;

        // THE FIX: Format the timestamps to IST directly in the SQL query.
        // The CONVERT_TZ function converts the UTC time from the database to IST.
        const [rows] = await db.promise().query(
            `SELECT 
                ticket_id, 
                status, 
                CONVERT_TZ(created_at, '+00:00', '+05:30') as created_at, 
                CONVERT_TZ(updated_at, '+00:00', '+05:30') as updated_at 
             FROM grievances 
             WHERE ticket_id = ?`,
            [ticket_id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Grievance not found' });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error('Error tracking grievance:', err);
        res.status(500).json({ error: 'Server error while tracking grievance' });
    }
};

export const getGrievancesByDepartment = (req, res) => {
    const { departmentId } = req.params;
    getGrievancesByDepartmentFromModel(departmentId, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching grievances' });
        res.json(results);
    });
};

export const listWorkersByDepartment = (req, res) => {
    const { departmentId } = req.params;
    getWorkersByDepartment(departmentId, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching workers' });
        res.json(results);
    });
};

export const addNewWorker = (req, res) => {
    const { name, email, phone_number, department_id } = req.body;
    createWorker({ name, email, phone_number, department_id }, (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error creating worker' });
        res.status(201).json({ message: 'Worker added successfully', workerId: result.insertId });
    });
};

export const assignGrievance = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { workerId, officeBearerEmail } = req.body;

        await db.promise().query(
            'UPDATE grievances SET status = ?, assigned_worker_id = ? WHERE ticket_id = ?',
            ['In Progress', workerId, ticketId]
        );

        const [grievanceDetails] = await db.promise().query(
            `SELECT g.*, c.name as category_name, w.name AS worker_name, w.email AS worker_email, w.phone_number AS worker_phone, u.roll_number
             FROM grievances g
             LEFT JOIN categories c ON g.category_id = c.id
             LEFT JOIN workers w ON g.assigned_worker_id = w.id
             LEFT JOIN users u ON g.email = u.email
             WHERE g.ticket_id = ?`,
            [ticketId]
        );

        const [bearerDetails] = await db.promise().query(
            `SELECT name, email, mobile_number FROM office_bearers WHERE email = ?`,
            [officeBearerEmail]
        );

        if (grievanceDetails.length) {
            const grievance = grievanceDetails[0];
            const worker = { name: grievance.worker_name, email: grievance.worker_email, phone_number: grievance.worker_phone };
            const officeBearer = bearerDetails.length ? bearerDetails[0] : null;

            sendGrievanceAssignedEmailToUser(grievance.email, grievance.complainant_name, ticketId, worker).catch(console.error);

            if (officeBearer) {
                sendGrievanceAssignedEmailToWorker(worker.email, worker.name, ticketId, grievance, officeBearer).catch(console.error);
            }
        }

        res.status(200).json({ message: 'Grievance assigned successfully' });
    } catch (err) {
        console.error('Error assigning grievance:', err);
        res.status(500).json({ error: 'Failed to assign grievance due to a server error.' });
    }
};

export const resolveGrievance = async (req, res) => {
    try {
        const { ticketId } = req.params;
        await db.promise().query(
            'UPDATE grievances SET status = ? WHERE ticket_id = ?',
            ['Resolved', ticketId]
        );
        const [details] = await db.promise().query(
            `SELECT email, complainant_name FROM grievances WHERE ticket_id = ?`,
            [ticketId]
        );
        if (details.length) {
            const grievance = details[0];
            sendGrievanceStatusUpdateEmail(grievance.email, grievance.complainant_name, ticketId, 'Resolved').catch(console.error);
        }
        res.status(200).json({ message: 'Grievance resolved successfully' });
    } catch (err) {
        console.error('Error resolving grievance:', err);
        res.status(500).json({ error: 'Failed to resolve grievance due to a server error.' });
    }
};
