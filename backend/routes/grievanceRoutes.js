import express from 'express';
import multer from 'multer';
import {
    listDepartments,
    listLocations,
    listCategories,
    submitGrievance,
    trackGrievance,
    getGrievancesByDepartment,
    listWorkersByDepartment,
    addNewWorker,
    assignGrievance,
    resolveGrievance,
    getEscalatedGrievances,
    revertGrievance,
    addOfficeBearer,
    getAllGrievancesForAdmin,
    getAdminDashboardStats,
    getLevel2Grievances,
    revertToLevel1,
    addApprovingAuthority,
    addLocation,
    addDepartment,
    addCategory,
    getUserGrievanceHistory,
    transferGrievance
} from '../controllers/grievanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply protect middleware to all routes that require authentication
router.use(protect);

router.get('/history/:email', getUserGrievanceHistory);
router.post('/submit', upload.single('attachment'), submitGrievance);
router.get('/track/:ticket_id(.*)', trackGrievance);
router.get('/departments', listDepartments);
router.get('/locations', listLocations);
router.get('/categories/:deptId', listCategories);
router.get('/department/:departmentId', getGrievancesByDepartment);
router.get('/workers/:departmentId', listWorkersByDepartment);
router.post('/workers', addNewWorker);
router.put('/:ticketId(.*)/assign', assignGrievance);
router.put('/:ticketId(.*)/resolve', resolveGrievance);
router.get('/escalated', getEscalatedGrievances);
router.put('/revert/:ticketId(.*)', revertGrievance);
router.post('/add-office-bearer', addOfficeBearer);
router.put('/transfer', transferGrievance);

// --- ADMIN ROUTES ---
router.get('/admin/all', getAllGrievancesForAdmin);
router.get('/admin/stats', getAdminDashboardStats);
router.get('/admin/escalated-level2', getLevel2Grievances);
router.put('/admin/revert-to-level-1/:ticketId(.*)', revertToLevel1);
router.post('/admin/add-authority', addApprovingAuthority);
router.post('/admin/add-location', addLocation);
router.post('/admin/add-department', addDepartment);
router.post('/admin/add-category', addCategory);

export default router;