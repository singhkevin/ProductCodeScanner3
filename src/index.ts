import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import scanRoutes from './routes/scanRoutes';
import statsRoutes from './routes/statsRoutes';

process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
    console.error('UNHANDLED PROMISE:', err);
});

const app = express();
const PORT = Number(process.env.PORT || 5000);

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Database URL defined:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not defined in environment variables.');
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/stats', statsRoutes);

const ROOT = path.join(__dirname, '../..');

app.use('/verify', express.static(path.join(ROOT, 'public-verifier/dist')));
app.use(express.static(path.join(ROOT, 'dashboard/dist')));

app.get('/verify/*path', (_, res) => {
    res.sendFile(path.join(ROOT, 'public-verifier/dist/index.html'));
});

app.get('/*path', (_, res) => {
    res.sendFile(path.join(ROOT, 'dashboard/dist/index.html'));
});

app.get('/health', (_, res) => {
    res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
