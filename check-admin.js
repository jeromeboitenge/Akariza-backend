const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.admin.findUnique({ 
    where: { email: 'jeromeboitenge@gmail.com' } 
  });
  console.log('Admin:', JSON.stringify(admin, null, 2));
  await prisma.$disconnect();
}

checkAdmin();
