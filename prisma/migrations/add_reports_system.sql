-- Add Report models for auto-generated reports

-- Daily Sales Report
CREATE TABLE "DailySalesReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "date" DATE NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averageTransaction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mobileSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    
    CONSTRAINT "DailySalesReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
    CONSTRAINT "DailySalesReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL
);

-- Monthly Sales Report
CREATE TABLE "MonthlySalesReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averagePerDay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mobileSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    
    CONSTRAINT "MonthlySalesReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
    CONSTRAINT "MonthlySalesReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL
);

-- Product Performance Report
CREATE TABLE "ProductPerformanceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "period" TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    "periodDate" DATE NOT NULL,
    "totalQuantitySold" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    
    CONSTRAINT "ProductPerformanceReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
    CONSTRAINT "ProductPerformanceReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Cashier Performance Report
CREATE TABLE "CashierPerformanceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averageTransaction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    
    CONSTRAINT "CashierPerformanceReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
    CONSTRAINT "CashierPerformanceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Inventory Report
CREATE TABLE "InventoryReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "date" DATE NOT NULL,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalStockValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lowStockCount" INTEGER NOT NULL DEFAULT 0,
    "outOfStockCount" INTEGER NOT NULL DEFAULT 0,
    "expiringCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    
    CONSTRAINT "InventoryReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
    CONSTRAINT "InventoryReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL
);

-- Create unique indexes
CREATE UNIQUE INDEX "DailySalesReport_organizationId_branchId_date_key" ON "DailySalesReport"("organizationId", "branchId", "date");
CREATE UNIQUE INDEX "MonthlySalesReport_organizationId_branchId_year_month_key" ON "MonthlySalesReport"("organizationId", "branchId", "year", "month");
CREATE UNIQUE INDEX "ProductPerformanceReport_productId_period_periodDate_key" ON "ProductPerformanceReport"("productId", "period", "periodDate");
CREATE UNIQUE INDEX "CashierPerformanceReport_userId_date_key" ON "CashierPerformanceReport"("userId", "date");
CREATE UNIQUE INDEX "InventoryReport_organizationId_branchId_date_key" ON "InventoryReport"("organizationId", "branchId", "date");

-- Create indexes for faster queries
CREATE INDEX "DailySalesReport_date_idx" ON "DailySalesReport"("date");
CREATE INDEX "MonthlySalesReport_year_month_idx" ON "MonthlySalesReport"("year", "month");
CREATE INDEX "ProductPerformanceReport_periodDate_idx" ON "ProductPerformanceReport"("periodDate");
CREATE INDEX "CashierPerformanceReport_date_idx" ON "CashierPerformanceReport"("date");
CREATE INDEX "InventoryReport_date_idx" ON "InventoryReport"("date");
