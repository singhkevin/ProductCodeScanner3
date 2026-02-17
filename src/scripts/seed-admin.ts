import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

        const hashedPassword = await bcrypt.hash(password, 10);

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

    } catch (err: any) {
        console.error('❌ Error seeding admin:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
