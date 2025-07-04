// /backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// make the db available on req.app.locals for our controller
app.locals.db = db;

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// serve uploaded files statically
app.use('/uploads', express.static('uploads'));

db.connect(err => {
    if (err) console.log('DB Connection Failed:', err);
    else console.log('MySQL Connected ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
