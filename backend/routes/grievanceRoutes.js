import express from 'express';
import multer from 'multer';
import {
    listDepartments,
    listCategories,
    submitGrievance,
    trackGrievance
} from '../controllers/grievanceController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// department/category lookups
router.get('/departments', listDepartments);
router.get('/categories/:deptId', listCategories);

// submit (optional attachment)
router.post('/submit', upload.single('attachment'), submitGrievance);

// track by ticket_id (URL‑encoded)
router.get('/track/:ticket_id', trackGrievance);

export default router;
