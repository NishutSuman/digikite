const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:', JSON.stringify(users, null, 2));
    console.log('Total users:', users.length);
  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();