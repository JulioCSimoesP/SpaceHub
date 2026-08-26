import app from '../src/app.js';
import connectDatabase from '../src/config/db.js';

let isConnected = false;

async function ensureDb() {
    if (!isConnected) {
        await connectDatabase();
        isConnected = true;
    }
}

export default async function handler(req, res) {
    try {
        await ensureDb();
        return app(req, res);
    } catch (error) {
        console.error('Erro na execução da função serverless:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}