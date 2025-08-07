// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import cronHandler from './api/cron.js';

dotenv.config();

const app = express();

// --- IMPORTANT: CORS Configuration for Separate Deployments ---
// This list contains all the URLs that are allowed to make requests to your backend.
const allowedOrigins = [
    'https://gmp-user-ui41.vercel.app', // Your deployed frontend
    'http://localhost:5174'             // Your local development environment
];

// --- UPDATED: More Robust CORS Options ---
const corsOptions = {
    origin: function (origin, callback) {
        // The '|| !origin' check allows requests with no origin (like mobile apps or curl)
        // and same-origin requests.
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            callback(new Error(msg), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
    credentials: true, // Allow cookies/authorization headers
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
// -----------------------------------------------------------

// Standard Middleware
app.use(express.json());

// Make the database connection available to routes
app.locals.db = db;

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// Vercel Cron Job Route
app.get('/api/cron', cronHandler);

// Serve uploaded files statically (if you have an 'uploads' directory)
app.use('/uploads', express.static('uploads'));

// Custom error handler middleware
app.use(errorHandler);

// A root endpoint for health checks
app.get('/', (req, res) => {
    res.send('Welcome to the Grievance Management System API!');
});

const PORT = process.env.PORT || 3000;


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}


export default app;