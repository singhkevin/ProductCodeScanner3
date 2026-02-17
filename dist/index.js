"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env')
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const scanRoutes_1 = __importDefault(require("./routes/scanRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', err => {
    console.error('UNHANDLED PROMISE:', err);
});
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 5000);
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Database URL defined:', !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not defined in environment variables.');
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/scans', scanRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
const ROOT = path_1.default.join(__dirname, '../..');
app.use('/verify', express_1.default.static(path_1.default.join(ROOT, 'public-verifier/dist')));
app.use(express_1.default.static(path_1.default.join(ROOT, 'dashboard/dist')));
app.get('/verify/*path', (_, res) => {
    res.sendFile(path_1.default.join(ROOT, 'public-verifier/dist/index.html'));
});
app.get('/*path', (_, res) => {
    res.sendFile(path_1.default.join(ROOT, 'dashboard/dist/index.html'));
});
app.get('/health', (_, res) => {
    res.json({ status: 'OK' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
