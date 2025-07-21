// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { checkAndEscalateGrievances } from './scripts/escalationCron.js';

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Make the database connection available to routes
app.locals.db = db;

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Custom error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const ESCALATION_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // --- AUTOMATED ESCALATION JOB ---
    console.log('Starting automated grievance escalation job...');

    // 1. Run the check immediately when the server starts.
    console.log('Performing initial escalation check on startup.');
    checkAndEscalateGrievances();

    // 2. Then, set it to run at the specified interval (every 30 minutes).
    setInterval(() => {
        console.log('Performing scheduled escalation check.');
        checkAndEscalateGrievances();
    }, ESCALATION_INTERVAL);

    console.log(`Escalation check scheduled to run every ${ESCALATION_INTERVAL / 60000} minutes.`);
});
