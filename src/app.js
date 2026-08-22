import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (caso fiquem no mesmo projeto)
app.use(express.static(path.join(__dirname, '../public')));

// Rota de teste
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API SpaceHub rodando!' });
});

export default app;