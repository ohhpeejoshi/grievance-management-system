import { getAllDepartments, getCategoriesByDept, createGrievance } from '../models/Grievance.js';
import imagekit from '../config/imagekit.js';
import { db } from '../config/db.js';
import { sendTicketIdEmail } from '../utils/sendTicketIdEmail.js';

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
export const submitGrievance = async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,
                fileName: `grievance_${Date.now()}_${req.file.originalname}`,
                folder: "/grievances",
            });
            imageUrl = uploadResponse.url;
        }

        const {
            title,
            description,
            location,
            department,
            category,
            urgency = 'Normal',
            mobileNumber,
            complainantName,
            email
        } = req.body;

        const department_id = parseInt(department, 10);
        const category_id = parseInt(category, 10);

        // Generate ticket_id
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const [rows] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM grievances
         WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`,
            [month, year]
        );
        const serialNo = String(rows[0].count + 1).padStart(4, '0');
        const ticket_id = `lnm/${year}/${month}/${serialNo}`;

        const resolutionMap = {
            Normal: '5 working days',
            High: '3 working days',
            Emergency: '1 working day'
        };
        const resolutionTime = resolutionMap[urgency] || resolutionMap.Normal;

        createGrievance(
            {
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
                ticket_id
            },
            (err) => {
                if (err) {
                    console.error('DB error inserting grievance:', err);
                    return res.status(500).json({ error: 'DB error inserting grievance' });
                }

                // Send confirmation email
                sendTicketIdEmail(email, complainantName, ticket_id, urgency, resolutionTime)
                    .then(() => console.log(`Grievance email sent to ${email}`))
                    .catch(mailErr => console.error('Grievance email error:', mailErr));

                res.status(201).json({
                    message: 'Grievance submitted successfully',
                    ticket_id
                });
            }
        );
    } catch (err) {
        console.error('ImageKit Upload/Error:', err);
        res.status(500).json({ error: 'Image upload or submission failed' });
    }
};

/**
 * GET /api/grievances/track/:ticket_id
 */
export const trackGrievance = async (req, res) => {
    try {
        const { ticket_id } = req.params;
        // const [rows] = await db.promise().query(
        //     `SELECT ticket_id, status, created_at, updated_at
        //  FROM grievances
        // WHERE ticket_id = ?`,
        //     [ticket_id]
        // );

        const [rows] = await db.promise().query(
            `SELECT ticket_id, status, created_at
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
