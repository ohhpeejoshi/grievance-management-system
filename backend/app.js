// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
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


app.get('/', (req, res) => {
    res.send('Welcome to the Grievance Management System!')
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // --- AUTOMATED ESCALATION JOB ---
    console.log('Starting automated grievance escalation job...');

    // Schedule the escalation check to run every 30 minutes.
    cron.schedule('*/30 * * * *', () => {
        console.log('Performing scheduled escalation check.');
        checkAndEscalateGrievances();
    });

    console.log(`Escalation check scheduled to run every 30 minutes.`);
});