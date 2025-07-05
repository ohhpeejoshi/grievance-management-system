import express from 'express';
import multer from 'multer';
import {
    listDepartments,
    listCategories,
    submitGrievance
} from '../controllers/grievanceController.js';

const router = express.Router();

// 🔁 Use memory storage so that we can directly send buffer to ImageKit
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/departments', listDepartments);
router.get('/categories/:deptId', listCategories);
router.post('/submit', upload.single('attachment'), submitGrievance);

export default router;
