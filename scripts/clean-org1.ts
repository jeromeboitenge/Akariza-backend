import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🗑️  Starting cleanup...');

    // Check what exists
    const orgs = await prisma.organization.findMany();
    console.log(`📊 Organizations: ${orgs.map(o => o.name).join(', ')}`);
    
    // Delete ALL organizations and their data
    for (const org of orgs) {
      console.log(`\n🗑️  Deleting organization: ${org.name} (${org.id})`);
      
      await prisma.$transaction(async (tx) => {
        // Delete all related data
        await tx.saleItem.deleteMany({ where: { sale: { organizationId: org.id } } });
        await tx.sale.deleteMany({ where: { organizationId: org.id } });
        await tx.purchaseItem.deleteMany({ where: { purchase: { organizationId: org.id } } });
        await tx.purchase.deleteMany({ where: { organizationId: org.id } });
        await tx.stockTransaction.deleteMany({ where: { organizationId: org.id } });
        await tx.promotionProduct.deleteMany({ where: { promotion: { organizationId: org.id } } });
        await tx.promotion.deleteMany({ where: { organizationId: org.id } });
        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { organizationId: org.id } } });
        await tx.purchaseOrder.deleteMany({ where: { organizationId: org.id } });
        await tx.stockTransferItem.deleteMany({ where: { transfer: { organizationId: org.id } } });
        await tx.stockTransfer.deleteMany({ where: { organizationId: org.id } });
        await tx.productBatch.deleteMany({ where: { product: { organizationId: org.id } } });
        await tx.productBarcode.deleteMany({ where: { product: { organizationId: org.id } } });
        await tx.priceHistory.deleteMany({ where: { product: { organizationId: org.id } } });
        await tx.branchInventory.deleteMany({ where: { product: { organizationId: org.id } } });
        await tx.product.deleteMany({ where: { organizationId: org.id } });
        await tx.supplier.deleteMany({ where: { organizationId: org.id } });
        await tx.customerTransaction.deleteMany({ where: { customer: { organizationId: org.id } } });
        await tx.loyaltyTransaction.deleteMany({ where: { customer: { organizationId: org.id } } });
        await tx.customer.deleteMany({ where: { organizationId: org.id } });
        await tx.employeeAttendance.deleteMany({ where: { employee: { organizationId: org.id } } });
        await tx.employeeTarget.deleteMany({ where: { employee: { organizationId: org.id } } });
        await tx.employee.deleteMany({ where: { organizationId: org.id } });
        await tx.message.deleteMany({ where: { organizationId: org.id } });
        await tx.task.deleteMany({ where: { organizationId: org.id } });
        await tx.expense.deleteMany({ where: { organizationId: org.id } });
        await tx.auditLog.deleteMany({ where: { organizationId: org.id } });
        await tx.user.deleteMany({ where: { organizationId: org.id } });
        await tx.branch.deleteMany({ where: { organizationId: org.id } });
        await tx.organization.delete({ where: { id: org.id } });
        
        console.log(`✅ Deleted ${org.name}`);
      });
    }

    // Keep only system admin with email jeromeboitenge@gmail.com
    const admins = await prisma.admin.findMany();
    console.log(`\n📊 Admins in database: ${admins.length}`);
    
    for (const admin of admins) {
      if (admin.email !== 'jeromeboitenge@gmail.com') {
        await prisma.admin.delete({ where: { id: admin.id } });
        console.log(`🗑️  Deleted admin: ${admin.email}`);
      } else {
        console.log(`✅ Kept admin: ${admin.email}`);
      }
    }

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
