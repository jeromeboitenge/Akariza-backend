import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

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
  console.log('✅ Admin created');

  // 2. Create Organizations
  const org1 = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: {
      id: 'org-1',
      name: 'SuperMart Retail Chain',
      businessType: 'Retail',
      address: '123 Main Street, Kigali',
      phone: '+250788123456',
      email: 'info@supermart.rw',
      createdById: admin.id,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { id: 'org-2' },
    update: {},
    create: {
      id: 'org-2',
      name: 'Fresh Foods Ltd',
      businessType: 'Wholesale',
      address: '456 Industrial Ave, Kigali',
      phone: '+250788654321',
      email: 'contact@freshfoods.rw',
      createdById: admin.id,
    },
  });
  console.log('✅ Organizations created');

  // 3. Create Branches for Org1
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      organizationId: org1.id,
      name: 'Main Branch - Kigali',
      code: 'MAIN',
      address: '123 Main Street, Kigali',
      phone: '+250788123456',
      email: 'main@supermart.rw',
      isMainBranch: true,
    },
  });

  const downtownBranch = await prisma.branch.upsert({
    where: { id: 'branch-downtown' },
    update: {},
    create: {
      id: 'branch-downtown',
      organizationId: org1.id,
      name: 'Downtown Branch',
      code: 'DT',
      address: '456 Downtown Ave, Kigali',
      phone: '+250788123457',
      email: 'downtown@supermart.rw',
    },
  });

  const kimirongoBranch = await prisma.branch.upsert({
    where: { id: 'branch-kimironko' },
    update: {},
    create: {
      id: 'branch-kimironko',
      organizationId: org1.id,
      name: 'Kimironko Branch',
      code: 'KMR',
      address: '789 Kimironko Road, Kigali',
      phone: '+250788123458',
      email: 'kimironko@supermart.rw',
    },
  });
  console.log('✅ Branches created');

  // 4. Create Users
  const boss = await prisma.user.upsert({
    where: { id: 'user-boss' },
    update: {},
    create: {
      id: 'user-boss',
      organizationId: org1.id,
      branchId: mainBranch.id,
      email: 'boss@supermart.rw',
      password: await bcrypt.hash('boss123', 10),
      fullName: 'John Mugisha',
      role: 'BOSS',
    },
  });

  const manager1 = await prisma.user.upsert({
    where: { id: 'user-manager1' },
    update: {},
    create: {
      id: 'user-manager1',
      organizationId: org1.id,
      branchId: mainBranch.id,
      email: 'manager1@supermart.rw',
      password: await bcrypt.hash('manager123', 10),
      fullName: 'Jane Uwase',
      role: 'MANAGER',
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { id: 'user-manager2' },
    update: {},
    create: {
      id: 'user-manager2',
      organizationId: org1.id,
      branchId: downtownBranch.id,
      email: 'manager2@supermart.rw',
      password: await bcrypt.hash('manager123', 10),
      fullName: 'Peter Nkusi',
      role: 'MANAGER',
    },
  });

  const cashier1 = await prisma.user.upsert({
    where: { id: 'user-cashier1' },
    update: {},
    create: {
      id: 'user-cashier1',
      organizationId: org1.id,
      branchId: mainBranch.id,
      email: 'cashier1@supermart.rw',
      password: await bcrypt.hash('cashier123', 10),
      fullName: 'Alice Mukamana',
      role: 'CASHIER',
    },
  });

  const cashier2 = await prisma.user.upsert({
    where: { id: 'user-cashier2' },
    update: {},
    create: {
      id: 'user-cashier2',
      organizationId: org1.id,
      branchId: downtownBranch.id,
      email: 'cashier2@supermart.rw',
      password: await bcrypt.hash('cashier123', 10),
      fullName: 'Bob Niyonzima',
      role: 'CASHIER',
    },
  });

  const cashier3 = await prisma.user.upsert({
    where: { id: 'user-cashier3' },
    update: {},
    create: {
      id: 'user-cashier3',
      organizationId: org1.id,
      branchId: kimirongoBranch.id,
      email: 'cashier3@supermart.rw',
      password: await bcrypt.hash('cashier123', 10),
      fullName: 'Grace Uwera',
      role: 'CASHIER',
    },
  });
  console.log('✅ Users created');

  // 5. Create Employees
  await prisma.employee.upsert({
    where: { userId: cashier1.id },
    update: {},
    create: {
      organizationId: org1.id,
      userId: cashier1.id,
      employeeCode: 'EMP001',
      department: 'Sales',
      position: 'Senior Cashier',
      salary: 200000,
      commissionRate: 3.0,
      hireDate: new Date('2024-01-15'),
    },
  });

  await prisma.employee.upsert({
    where: { userId: cashier2.id },
    update: {},
    create: {
      organizationId: org1.id,
      userId: cashier2.id,
      employeeCode: 'EMP002',
      department: 'Sales',
      position: 'Cashier',
      salary: 150000,
      commissionRate: 2.5,
      hireDate: new Date('2024-03-01'),
    },
  });

  await prisma.employee.upsert({
    where: { userId: cashier3.id },
    update: {},
    create: {
      organizationId: org1.id,
      userId: cashier3.id,
      employeeCode: 'EMP003',
      department: 'Sales',
      position: 'Cashier',
      salary: 150000,
      commissionRate: 2.5,
      hireDate: new Date('2024-06-01'),
    },
  });
  console.log('✅ Employees created');

  // 6. Create Suppliers
  const suppliers = [];
  const supplierData = [
    { name: 'ABC Wholesalers', contact: 'David Kalisa', phone: '+250788111111', email: 'abc@wholesale.rw', rating: 4.5, credit: 5000000 },
    { name: 'XYZ Distributors', contact: 'Sarah Mutesi', phone: '+250788222222', email: 'xyz@dist.rw', rating: 4.0, credit: 3000000 },
    { name: 'Fresh Produce Ltd', contact: 'James Habimana', phone: '+250788333333', email: 'fresh@produce.rw', rating: 4.8, credit: 2000000 },
    { name: 'Dairy Products Co', contact: 'Mary Uwimana', phone: '+250788444444', email: 'dairy@products.rw', rating: 4.3, credit: 1500000 },
    { name: 'Grain Suppliers Inc', contact: 'Eric Nsengimana', phone: '+250788555555', email: 'grain@suppliers.rw', rating: 4.6, credit: 4000000 },
  ];

  for (const s of supplierData) {
    const supplier = await prisma.supplier.create({
      data: {
        organizationId: org1.id,
        name: s.name,
        contactPerson: s.contact,
        phone: s.phone,
        email: s.email,
        address: 'Kigali, Rwanda',
        rating: s.rating,
        creditLimit: s.credit,
        paymentTerms: 'Net 30',
        createdById: boss.id,
      },
    });
    suppliers.push(supplier);
  }
  console.log('✅ Suppliers created');

  console.log('\n🎉 Comprehensive seeding completed!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('System Admin: admin@akariza.com / admin123');
  console.log('Boss: boss@supermart.rw / boss123');
  console.log('Manager 1: manager1@supermart.rw / manager123');
  console.log('Manager 2: manager2@supermart.rw / manager123');
  console.log('Cashier 1: cashier1@supermart.rw / cashier123');
  console.log('Cashier 2: cashier2@supermart.rw / cashier123');
  console.log('Cashier 3: cashier3@supermart.rw / cashier123');
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
