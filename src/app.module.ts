import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { HealthController } from './health.controller';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { StockModule } from './stock/stock.module';
import { ReportsModule } from './reports/reports.module';
import { SyncModule } from './sync/sync.module';
import { BranchesModule } from './branches/branches.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { PromotionsModule } from './promotions/promotions.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ExpensesModule } from './expenses/expenses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './tasks/tasks.module';
import { MessagesModule } from './messages/messages.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailModule,
    OrganizationsModule,
    UsersModule,
    ProductsModule,
    SuppliersModule,
    PurchasesModule,
    SalesModule,
    StockModule,
    ReportsModule,
    SyncModule,
    BranchesModule,
    CustomersModule,
    EmployeesModule,
    PromotionsModule,
    PurchaseOrdersModule,
    ExpensesModule,
    NotificationsModule,
    TasksModule,
    MessagesModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
