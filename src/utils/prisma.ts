import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('✅ Connected to Supabase Database'))
  .catch((err) => console.error('❌ Database Connection Error:', err.message));

export default prisma;
