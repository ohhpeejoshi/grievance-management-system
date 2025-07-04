// /backend/routes/grievanceRoutes.js
import express from 'express';
import multer from 'multer';
import {
    listDepartments,
    listCategories,
    submitGrievance
} from '../controllers/grievanceController.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});
const upload = multer({ storage });

// Routes
router.get('/departments', listDepartments);
router.get('/categories/:deptId', listCategories);
router.post('/submit', upload.single('attachment'), submitGrievance);

export default router;
