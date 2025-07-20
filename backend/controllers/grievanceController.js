import {
    getAllDepartments,
    getAllLocations,
    getCategoriesByDept,
    createGrievance,
    getGrievancesByDepartment as getGrievancesByDepartmentFromModel,
    updateGrievanceStatus,
    getGrievancesByEmail
} from '../models/Grievance.js';
import { createApprovingAuthority } from '../models/ApprovingAuthority.js';
import { getWorkersByDepartment, createWorker } from '../models/Worker.js';
import {
    sendGrievanceStatusUpdateEmail,
    sendGrievanceAssignedEmailToUser,
    sendGrievanceAssignedEmailToWorker,
    sendRevertNotificationEmail
} from '../utils/mail.js';
import imagekit from '../config/imagekit.js';
import { db } from '../config/db.js';
import bcrypt from 'bcrypt';

const calculateDeadline = (hours) => {
    let deadline = new Date();
    let remainingHours = hours;
    while (remainingHours > 0) {
        deadline.setHours(deadline.getHours() + 1);
        if (deadline.getDay() !== 0) {
            remainingHours--;
        }
    }
    return deadline;
};

// NEW: Controller to handle fetching user's grievance history
export const getUserGrievanceHistory = (req, res) => {
    const { email } = req.params;
    getGrievancesByEmail(email, (err, results) => {
        if (err) {
            console.error("DB error fetching grievance history:", err);
            return res.status(500).json({ error: 'DB error fetching grievance history' });
        }
        res.json(results);
    });
};


export const listDepartments = (req, res) => {
    getAllDepartments((err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching departments' });
        res.json(results);
    });
};

export const listLocations = (req, res) => {
    getAllLocations((err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching locations' });
        res.json(results.map(loc => loc.name));
    });
};

// ... (existing functions: listCategories, submitGrievance, etc.)
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

        let response_deadline, resolution_deadline;

        switch (urgency) {
            case 'Emergency':
                response_deadline = calculateDeadline(6);
                resolution_deadline = calculateDeadline(24);
                break;
            case 'High':
                response_deadline = calculateDeadline(36); // 1.5 days
                resolution_deadline = calculateDeadline(72); // 3 days
                break;
            default: // Normal
                response_deadline = calculateDeadline(60); // 2.5 days
                resolution_deadline = calculateDeadline(120); // 5 days
                break;
        }

        createGrievance({
            ticket_id,
            title,
            description,
            location,
            department_id,
            category_id,
            urgency,
            attachmentPath: imageUrl,
            mobile_number: mobileNumber,
            complainant_name: complainantName,
            email,
            response_deadline,
            resolution_deadline
        }, (err) => {
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
        const [rows] = await db.promise().query(
            `SELECT
                ticket_id,
                status,
                created_at,
                updated_at
             FROM grievances
             WHERE ticket_id = ?`,
            [ticket_id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Grievance not found' });
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

        updateGrievanceStatus(ticketId, 'In Progress', workerId, async (err) => {
            if (err) throw err;

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
        });
    } catch (err) {
        console.error('Error assigning grievance:', err);
        res.status(500).json({ error: 'Failed to assign grievance due to a server error.' });
    }
};

export const resolveGrievance = async (req, res) => {
    try {
        const { ticketId } = req.params;
        updateGrievanceStatus(ticketId, 'Resolved', null, async (err) => {
            if (err) throw err;

            const [details] = await db.promise().query(
                `SELECT email, complainant_name FROM grievances WHERE ticket_id = ?`,
                [ticketId]
            );
            if (details.length) {
                const grievance = details[0];
                sendGrievanceStatusUpdateEmail(grievance.email, grievance.complainant_name, ticketId, 'Resolved').catch(console.error);
            }
            res.status(200).json({ message: 'Grievance resolved successfully' });
        });
    } catch (err) {
        console.error('Error resolving grievance:', err);
        res.status(500).json({ error: 'Failed to resolve grievance due to a server error.' });
    }
};

export const getEscalatedGrievances = (req, res) => {
    const sql = `
        SELECT
            g.ticket_id,
            g.title,
            g.urgency,
            g.status,
            g.created_at,
            g.escalation_level,
            d.name AS department_name
        FROM grievances g
        JOIN departments d ON g.department_id = d.id
        WHERE g.escalation_level = 1
        ORDER BY g.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("DB error fetching escalated grievances:", err);
            return res.status(500).json({ error: 'DB error fetching escalated grievances' });
        }
        res.json(results);
    });
};

export const revertGrievance = (req, res) => {
    const { ticketId } = req.params;
    const { new_resolution_days } = req.body;

    const new_resolution_hours = new_resolution_days * 24;
    const new_resolution_deadline = calculateDeadline(new_resolution_hours);

    const sql = "UPDATE grievances SET resolution_deadline = ?, escalation_level = 0 WHERE ticket_id = ?";
    db.query(sql, [new_resolution_deadline, ticketId], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error reverting grievance' });
        res.status(200).json({ message: 'Grievance reverted with new resolution time.' });
    });
};

export const addOfficeBearer = (req, res) => {
    const { name, email, password, mobile_number, role, department } = req.body;
    const saltRounds = 6;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }
        const sql = `
            INSERT INTO office_bearers (name, email, password, mobile_number, role, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [name, email, hashedPassword, mobile_number, role, department], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error creating office bearer' });
            }
            res.status(201).json({ message: 'Office bearer added successfully', id: result.insertId });
        });
    });
};

// --- ADMIN FUNCTIONS ---

export const getAllGrievancesForAdmin = (req, res) => {
    const sql = `
        SELECT 
            g.*, 
            d.name as department_name, 
            c.name as category_name
        FROM grievances g
        JOIN departments d ON g.department_id = d.id
        JOIN categories c ON g.category_id = c.id
        ORDER BY g.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching all grievances' });
        res.json(results);
    });
};

export const getAdminDashboardStats = (req, res) => {
    const queries = {
        byDepartment: `SELECT d.name, COUNT(g.id) as count FROM grievances g JOIN departments d ON g.department_id = d.id GROUP BY d.name`,
        byStatus: `SELECT status, COUNT(id) as count FROM grievances GROUP BY status`,
        byEscalation: `SELECT escalation_level, COUNT(id) as count FROM grievances WHERE escalation_level > 0 GROUP BY escalation_level`,
    };

    db.promise().query(queries.byDepartment)
        .then(([deptRows]) => {
            db.promise().query(queries.byStatus)
                .then(([statusRows]) => {
                    db.promise().query(queries.byEscalation)
                        .then(([escalationRows]) => {
                            res.json({
                                byDepartment: deptRows,
                                byStatus: statusRows,
                                byEscalation: escalationRows,
                            });
                        });
                });
        })
        .catch(err => res.status(500).json({ error: 'DB error fetching stats', details: err }));
};

export const getLevel2Grievances = (req, res) => {
    const sql = `
        SELECT
            g.ticket_id, g.title, g.escalation_level, d.name as department_name
        FROM grievances g
        JOIN departments d ON g.department_id = d.id
        WHERE g.escalation_level >= 2
        ORDER BY g.escalation_level DESC, g.created_at ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error fetching Level 2 grievances' });
        res.json(results);
    });
};

export const revertToLevel1 = async (req, res) => {
    const { ticketId } = req.params;
    const { new_resolution_days, comment, adminEmail } = req.body;

    try {
        const new_resolution_hours = new_resolution_days * 24;
        const new_resolution_deadline = calculateDeadline(new_resolution_hours);

        const updateSql = "UPDATE grievances SET resolution_deadline = ?, escalation_level = 1 WHERE ticket_id = ?";
        await db.promise().query(updateSql, [new_resolution_deadline, ticketId]);

        const [authorities] = await db.promise().query('SELECT email FROM approving_authorities');
        const authorityEmails = authorities.map(a => a.email);

        if (authorityEmails.length > 0) {
            const grievanceDetails = { ticket_id: ticketId };
            await sendRevertNotificationEmail(grievanceDetails, comment, adminEmail, authorityEmails);
        }

        res.status(200).json({ message: 'Grievance reverted to Level 1.' });
    } catch (err) {
        console.error("Error reverting to level 1:", err);
        res.status(500).json({ error: 'DB error reverting grievance' });
    }
};


export const addApprovingAuthority = (req, res) => {
    const { name, email, password, mobile_number } = req.body;
    bcrypt.hash(password, 6, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Password encryption failed.' });
        createApprovingAuthority({ name, email, hashedPassword, mobile_number, role: 'Approving Authority' }, (err2, result) => {
            if (err2) return res.status(500).json({ error: 'Database error.' });
            res.status(201).json({ message: 'Approving Authority added successfully.', id: result.insertId });
        });
    });
};

export const addLocation = (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO locations (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error adding location' });
        res.status(201).json({ message: 'Location added successfully', id: result.insertId });
    });
};

export const addDepartment = (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO departments (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error adding department' });
        res.status(201).json({ message: 'Department added successfully', id: result.insertId });
    });
};

export const addCategory = (req, res) => {
    const { name, department_id, urgency } = req.body;
    db.query('INSERT INTO categories (name, department_id, urgency) VALUES (?, ?, ?)', [name, department_id, urgency], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error adding category' });
        res.status(201).json({ message: 'Category added successfully', id: result.insertId });
    });
};