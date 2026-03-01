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
      
      // Delete in smaller batches to avoid timeout
      await prisma.saleItem.deleteMany({ where: { sale: { organizationId: org.id } } });
      await prisma.sale.deleteMany({ where: { organizationId: org.id } });
      await prisma.purchaseItem.deleteMany({ where: { purchase: { organizationId: org.id } } });
      await prisma.purchase.deleteMany({ where: { organizationId: org.id } });
      await prisma.stockTransaction.deleteMany({ where: { organizationId: org.id } });
      await prisma.promotionProduct.deleteMany({ where: { promotion: { organizationId: org.id } } });
      await prisma.promotion.deleteMany({ where: { organizationId: org.id } });
      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { organizationId: org.id } } });
      await prisma.purchaseOrder.deleteMany({ where: { organizationId: org.id } });
      await prisma.stockTransferItem.deleteMany({ where: { transfer: { organizationId: org.id } } });
      await prisma.stockTransfer.deleteMany({ where: { organizationId: org.id } });
      await prisma.productBatch.deleteMany({ where: { product: { organizationId: org.id } } });
      await prisma.productBarcode.deleteMany({ where: { product: { organizationId: org.id } } });
      await prisma.priceHistory.deleteMany({ where: { product: { organizationId: org.id } } });
      await prisma.branchInventory.deleteMany({ where: { product: { organizationId: org.id } } });
      await prisma.product.deleteMany({ where: { organizationId: org.id } });
      await prisma.supplier.deleteMany({ where: { organizationId: org.id } });
      await prisma.customerTransaction.deleteMany({ where: { customer: { organizationId: org.id } } });
      await prisma.loyaltyTransaction.deleteMany({ where: { customer: { organizationId: org.id } } });
      await prisma.customer.deleteMany({ where: { organizationId: org.id } });
      await prisma.employeeAttendance.deleteMany({ where: { employee: { organizationId: org.id } } });
      await prisma.employeeTarget.deleteMany({ where: { employee: { organizationId: org.id } } });
      await prisma.employee.deleteMany({ where: { organizationId: org.id } });
      await prisma.message.deleteMany({ where: { organizationId: org.id } });
      await prisma.task.deleteMany({ where: { organizationId: org.id } });
      await prisma.expense.deleteMany({ where: { organizationId: org.id } });
      await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
      await prisma.user.deleteMany({ where: { organizationId: org.id } });
      await prisma.branch.deleteMany({ where: { organizationId: org.id } });
      await prisma.organization.delete({ where: { id: org.id } });
      
      console.log(`✅ Deleted ${org.name}`);
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
