// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron'; // Import node-cron
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import errorHandler from './middleware/errorHandler.js';
// Correctly import the escalation logic from the 'scripts' directory
import { checkAndEscalateGrievances } from './scripts/escalationCron.js';

dotenv.config();

const app = express();

// This can be a simple CORS setup for local development
app.use(cors());

// Standard Middleware
app.use(express.json());

// Make the database connection available to routes
app.locals.db = db;

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// Serve uploaded files statically (if you have an 'uploads' directory)
app.use('/uploads', express.static('uploads'));

// Custom error handler middleware
app.use(errorHandler);

// A root endpoint for health checks
app.get('/', (req, res) => {
    res.send('Welcome to the Grievance Management System API!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // --- AUTOMATED ESCALATION JOB using node-cron ---
    console.log('Starting automated grievance escalation job...');

    // Schedule the escalation check to run every 30 minutes.
    cron.schedule('*/30 * * * *', () => {
        console.log('Performing scheduled escalation check.');
        checkAndEscalateGrievances();
    });

    console.log(`Escalation check scheduled to run every 30 minutes.`);
});

export default app;