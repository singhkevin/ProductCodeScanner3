import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import scanRoutes from './routes/scanRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Product Code Scanner API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
