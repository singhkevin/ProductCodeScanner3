"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
prisma.$connect()
    .then(() => console.log('✅ Connected to Supabase Database'))
    .catch((err) => console.error('❌ Database Connection Error:', err.message));
exports.default = prisma;
