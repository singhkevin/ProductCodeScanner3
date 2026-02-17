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
    console.log('🚀 Seeding Company User...');
    try {
        // 1. Find or create the company
        let company = await prisma.company.findFirst({
            where: { name: 'Test Corp' }
        });
        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: 'Test Corp',
                    description: 'Testing the Product Scanner App',
                }
            });
            console.log('✅ Created "Test Corp" Company');
        }
        const email = 'company@example.com';
        const password = 'company-password-123';
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.log(`ℹ️ User ${email} already exists.`);
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const companyUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test Corp Manager',
                role: 'COMPANY',
                companyId: company.id,
            },
        });
        console.log('✅ Company User Created Successfully!');
        console.log('-----------------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Company: ${company.name}`);
        console.log('-----------------------------------');
    }
    catch (err) {
        console.error('❌ Error seeding company user:', err.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
