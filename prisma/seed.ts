import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create System Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@akariza.com' },
    update: {},
    create: {
      email: 'admin@akariza.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'SYSTEM_ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: {
      id: 'org-1',
      name: 'Demo Retail Store',
      businessType: 'Retail',
      address: '123 Main Street, Kigali',
      phone: '+250788123456',
      email: 'demo@store.com',
      createdById: admin.id,
    },
  });
  console.log('✅ Organization created:', org.name);

  // 3. Create Branches
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: {
      id: 'branch-1',
      organizationId: org.id,
      name: 'Main Branch',
      code: 'MAIN',
      address: '123 Main Street, Kigali',
      phone: '+250788123456',
      email: 'main@store.com',
      isMainBranch: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-2' },
    update: {},
    create: {
      id: 'branch-2',
      organizationId: org.id,
      name: 'Downtown Branch',
      code: 'DT',
      address: '456 Downtown Ave, Kigali',
      phone: '+250788123457',
      email: 'downtown@store.com',
    },
  });
  console.log('✅ Branches created');

  // 4. Create Users
  const boss = await prisma.user.upsert({
    where: { id: 'user-boss' },
    update: {},
    create: {
      id: 'user-boss',
      organizationId: org.id,
      branchId: mainBranch.id,
      email: 'boss@store.com',
      password: await bcrypt.hash('boss123', 10),
      fullName: 'John Boss',
      role: 'BOSS',
    },
  });

  const manager = await prisma.user.upsert({
    where: { id: 'user-manager' },
    update: {},
    create: {
      id: 'user-manager',
      organizationId: org.id,
      branchId: mainBranch.id,
      email: 'manager@store.com',
      password: await bcrypt.hash('manager123', 10),
      fullName: 'Jane Manager',
      role: 'MANAGER',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { id: 'user-cashier' },
    update: {},
    create: {
      id: 'user-cashier',
      organizationId: org.id,
      branchId: mainBranch.id,
      email: 'cashier@store.com',
      password: await bcrypt.hash('cashier123', 10),
      fullName: 'Mike Cashier',
      role: 'CASHIER',
    },
  });
  console.log('✅ Users created');

  // 5. Create Employees
  await prisma.employee.upsert({
    where: { userId: cashier.id },
    update: {},
    create: {
      organizationId: org.id,
      userId: cashier.id,
      employeeCode: 'EMP001',
      department: 'Sales',
      position: 'Cashier',
      salary: 150000,
      commissionRate: 2.5,
      hireDate: new Date('2024-01-01'),
    },
  });
  console.log('✅ Employees created');

  // 6. Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'ABC Wholesalers',
        contactPerson: 'David Smith',
        phone: '+250788111111',
        email: 'abc@wholesale.com',
        address: 'Industrial Area, Kigali',
        rating: 4.5,
        creditLimit: 5000000,
        paymentTerms: 'Net 30',
        createdById: boss.id,
      },
    }),
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'XYZ Distributors',
        contactPerson: 'Sarah Johnson',
        phone: '+250788222222',
        email: 'xyz@dist.com',
        address: 'Nyabugogo, Kigali',
        rating: 4.0,
        creditLimit: 3000000,
        paymentTerms: 'Net 15',
        createdById: boss.id,
      },
    }),
  ]);
  console.log('✅ Suppliers created');

  // 7. Create Products
  const product1 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: 'RICE-25' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Rice 25kg',
      sku: 'RICE-25',
      category: 'Grains',
      unit: 'bag',
      costPrice: 18000,
      sellingPrice: 22000,
      currentStock: 50,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 15,
      createdById: boss.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: 'SUGAR-1' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Sugar 1kg',
      sku: 'SUGAR-1',
      category: 'Groceries',
      unit: 'kg',
      costPrice: 1200,
      sellingPrice: 1500,
      currentStock: 200,
      minStockLevel: 50,
      maxStockLevel: 500,
      reorderPoint: 75,
      createdById: boss.id,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: 'OIL-5' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Cooking Oil 5L',
      sku: 'OIL-5',
      category: 'Groceries',
      unit: 'bottle',
      costPrice: 12000,
      sellingPrice: 15000,
      currentStock: 30,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 15,
      hasExpiry: true,
      createdById: boss.id,
    },
  });

  const product4 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: 'MILK-1' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Milk 1L',
      sku: 'MILK-1',
      category: 'Dairy',
      unit: 'liter',
      costPrice: 800,
      sellingPrice: 1000,
      currentStock: 100,
      minStockLevel: 20,
      maxStockLevel: 200,
      reorderPoint: 30,
      hasExpiry: true,
      createdById: boss.id,
    },
  });

  const product5 = await prisma.product.upsert({
    where: { organizationId_sku: { organizationId: org.id, sku: 'BREAD-1' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Bread',
      sku: 'BREAD-1',
      category: 'Bakery',
      unit: 'piece',
      costPrice: 500,
      sellingPrice: 700,
      currentStock: 50,
      minStockLevel: 20,
      maxStockLevel: 100,
      reorderPoint: 30,
      hasExpiry: true,
      createdById: boss.id,
    },
  });

  const products = [product1, product2, product3, product4, product5];
  console.log('✅ Products created');

  // 8. Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Alice Mukamana',
        phone: '+250788333333',
        email: 'alice@email.com',
        address: 'Kimironko, Kigali',
        customerType: 'VIP',
        loyaltyPoints: 500,
        creditLimit: 100000,
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Bob Niyonzima',
        phone: '+250788444444',
        address: 'Remera, Kigali',
        customerType: 'REGULAR',
        loyaltyPoints: 150,
      },
    }),
  ]);
  console.log('✅ Customers created');

  // 9. Create Purchases
  const purchase1 = await prisma.purchase.create({
    data: {
      organizationId: org.id,
      branchId: mainBranch.id,
      purchaseNumber: 'PUR-2026-001',
      supplierId: suppliers[0].id,
      totalAmount: 1000000,
      discount: 50000,
      tax: 0,
      finalAmount: 950000,
      paymentStatus: 'PAID',
      amountPaid: 950000,
      createdById: manager.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 50,
            costPrice: 18000,
            total: 900000,
          },
          {
            productId: products[1].id,
            quantity: 50,
            costPrice: 1200,
            total: 60000,
          },
        ],
      },
    },
  });
  console.log('✅ Purchases created');

  // 10. Create Sales
  const sale1 = await prisma.sale.create({
    data: {
      organizationId: org.id,
      branchId: mainBranch.id,
      customerId: customers[0].id,
      saleNumber: 'SALE-2026-001',
      totalAmount: 45000,
      discount: 2000,
      tax: 0,
      finalAmount: 43000,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      customerName: customers[0].name,
      createdById: cashier.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            sellingPrice: 22000,
            costPrice: 18000,
            total: 22000,
          },
          {
            productId: products[1].id,
            quantity: 10,
            sellingPrice: 1500,
            costPrice: 1200,
            total: 15000,
          },
          {
            productId: products[2].id,
            quantity: 1,
            sellingPrice: 15000,
            costPrice: 12000,
            total: 15000,
          },
        ],
      },
    },
  });

  await prisma.sale.create({
    data: {
      organizationId: org.id,
      branchId: mainBranch.id,
      customerId: customers[1].id,
      saleNumber: 'SALE-2026-002',
      totalAmount: 3500,
      discount: 0,
      tax: 0,
      finalAmount: 3500,
      paymentMethod: 'MOBILE',
      paymentStatus: 'PAID',
      customerName: customers[1].name,
      createdById: cashier.id,
      items: {
        create: [
          {
            productId: products[3].id,
            quantity: 2,
            sellingPrice: 1000,
            costPrice: 800,
            total: 2000,
          },
          {
            productId: products[4].id,
            quantity: 2,
            sellingPrice: 700,
            costPrice: 500,
            total: 1400,
          },
        ],
      },
    },
  });
  console.log('✅ Sales created');

  // 11. Create Promotions
  await prisma.promotion.create({
    data: {
      organizationId: org.id,
      name: 'Weekend Special',
      type: 'DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: new Date('2026-02-22'),
      endDate: new Date('2026-02-28'),
      isActive: true,
      products: {
        create: [
          { productId: products[1].id },
          { productId: products[2].id },
        ],
      },
    },
  });
  console.log('✅ Promotions created');

  // 12. Create Purchase Orders
  await prisma.purchaseOrder.create({
    data: {
      organizationId: org.id,
      poNumber: 'PO-2026-001',
      supplierId: suppliers[1].id,
      status: 'PENDING',
      totalAmount: 500000,
      expectedDate: new Date('2026-03-01'),
      createdById: manager.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 20,
            unitPrice: 18000,
            total: 360000,
          },
          {
            productId: products[2].id,
            quantity: 10,
            unitPrice: 12000,
            total: 120000,
          },
        ],
      },
    },
  });
  console.log('✅ Purchase Orders created');

  // 13. Create Expenses
  await Promise.all([
    prisma.expense.create({
      data: {
        organizationId: org.id,
        category: 'RENT',
        amount: 200000,
        description: 'Monthly rent for main branch',
        date: new Date('2026-02-01'),
        paymentMethod: 'BANK_TRANSFER',
        createdById: boss.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: org.id,
        category: 'UTILITIES',
        amount: 50000,
        description: 'Electricity bill',
        date: new Date('2026-02-15'),
        paymentMethod: 'CASH',
        createdById: manager.id,
      },
    }),
  ]);
  console.log('✅ Expenses created');

  // 14. Create Tasks
  await prisma.task.create({
    data: {
      organizationId: org.id,
      title: 'Check inventory levels',
      description: 'Review all products below minimum stock',
      assignedTo: manager.id,
      assignedBy: boss.id,
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2026-02-25'),
    },
  });
  console.log('✅ Tasks created');

  // 15. Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: manager.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'Cooking Oil 5L is running low',
        data: { productId: products[2].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: boss.id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have a new task to review',
      },
    }),
  ]);
  console.log('✅ Notifications created');

  // 16. Create Messages
  await prisma.message.create({
    data: {
      organizationId: org.id,
      senderId: boss.id,
      receiverId: manager.id,
      message: 'Please review the inventory report',
    },
  });
  console.log('✅ Messages created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('System Admin:');
  console.log('  Email: admin@akariza.com');
  console.log('  Password: admin123');
  console.log('\nBoss:');
  console.log('  Email: boss@store.com');
  console.log('  Password: boss123');
  console.log('\nManager:');
  console.log('  Email: manager@store.com');
  console.log('  Password: manager123');
  console.log('\nCashier:');
  console.log('  Email: cashier@store.com');
  console.log('  Password: cashier123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
