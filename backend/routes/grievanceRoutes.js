// backend/routes/grievanceRoutes.js
import express from 'express';
import multer from 'multer';
import {
    listDepartments,
    listCategories,
    submitGrievance,
    trackGrievance,
    getGrievancesByDepartment,
    listWorkersByDepartment,
    addNewWorker,
    assignGrievance,
    resolveGrievance
} from '../controllers/grievanceController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Grievance Submission and Tracking ---
router.post('/submit', upload.single('attachment'), submitGrievance);
// THE FIX: Changed the parameter from :ticket_id(*) to :ticket_id(.*)
router.get('/track/:ticket_id(.*)', trackGrievance);

// --- Department and Category Lookups ---
router.get('/departments', listDepartments);
router.get('/categories/:deptId', listCategories);

// --- Office Bearer Specific Routes ---
router.get('/department/:departmentId', getGrievancesByDepartment);

// --- Worker Management Routes ---
router.get('/workers/:departmentId', listWorkersByDepartment);
router.post('/workers', addNewWorker);

// --- Grievance Action Routes ---
// THE FIX: Changed the parameter from :ticketId(*) to :ticketId(.*)
router.put('/:ticketId(.*)/assign', assignGrievance);
router.put('/:ticketId(.*)/resolve', resolveGrievance);


export default router;
