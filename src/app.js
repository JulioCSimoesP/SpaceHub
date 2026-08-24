import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import spaceRoutes from './routes/spaceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API SpaceHub rodando!' });
});

export default app;