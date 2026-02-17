"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Seeding Admin User...');
    try {
        const email = 'admin@example.com';
        const password = 'admin-password-123';
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.log(`ℹ️ User ${email} already exists.`);
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'System Admin',
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin User Created Successfully!');
        console.log('-----------------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
    }
    catch (err) {
        console.error('❌ Error seeding admin:', err.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
