import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'boitenge311@gmail.com';
  const newPassword = 'Password123!';
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { 
      organizationId_email: {
        email,
        organizationId: 'org-1' // Change this to the correct org ID
      }
    },
    data: { 
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  
  console.log('✅ Password reset for:', user.email);
  console.log('🔑 New password:', newPassword);
}

resetPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
