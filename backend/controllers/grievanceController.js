// /backend/controllers/grievanceController.js
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

        // ⬆️ Upload to ImageKit only if file is attached
        if (req.file && req.file.buffer) {
            try {
                const uploadResponse = await imagekit.upload({
                    file: req.file.buffer,
                    fileName: `grievance_${Date.now()}_${req.file.originalname}`,
                    folder: "/grievances",
                });
                imageUrl = uploadResponse.url;
            } catch (uploadErr) {
                console.error('ImageKit upload failed:', uploadErr);
                // continue without image
                imageUrl = null;
            }
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

        // 🆕 Generate ticket_id
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const [rows] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM grievances WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`,
            [month, year]
        );
        const count = rows[0].count + 1;
        const serialNo = String(count).padStart(4, '0');

        const ticket_id = `lnm/${year}/${month}/${serialNo}`;

        const resolutionMap = {
            Normal: '5 working days',
            High: '3 working days',
            Emergency: '1 working day'
        };
        const resolutionTime = resolutionMap[urgency] || resolutionMap.Normal;

        // ✅ Insert grievance with imageUrl (can be null)
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

                // ✉️ Send confirmation email
                sendTicketIdEmail(email, complainantName, ticket_id, urgency, resolutionTime)
                    .then(() => console.log(`Grievance email sent to ${email}`))
                    .catch(mailErr => console.error('Grievance email error:', mailErr));

                // ✅ Final response
                res.status(201).json({
                    message: 'Grievance submitted successfully',
                    ticket_id
                });
            }
        );
    } catch (err) {
        console.error('Grievance submission failed:', err);
        res.status(500).json({ error: 'Grievance submission failed' });
    }
};
