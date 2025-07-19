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

app.locals.db = db;

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);


app.use('/uploads', express.static('uploads'));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
