#!/bin/bash

# Fix all missing SYSTEM_ADMIN roles

echo "Fixing role permissions to include SYSTEM_ADMIN..."

# Stock controller
sed -i "s/@Roles('BOSS', 'MANAGER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')/g" src/stock/stock.controller.ts

# Products controller - update and deactivate
sed -i "s/@Roles('BOSS', 'MANAGER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')/g" src/products/products.controller.ts

# Employees controller - update and set target
sed -i "s/@Roles('BOSS')/@Roles('SYSTEM_ADMIN', 'BOSS')/g" src/employees/employees.controller.ts

# Customers controller - all operations
sed -i "s/@Roles('BOSS', 'MANAGER', 'CASHIER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')/g" src/customers/customers.controller.ts
sed -i "s/@Roles('BOSS', 'MANAGER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')/g" src/customers/customers.controller.ts

# Sales controller - get all
sed -i "s/@Roles('BOSS', 'MANAGER', 'CASHIER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')/g" src/sales/sales.controller.ts

# Tasks controller - delete
sed -i "s/@Roles('BOSS', 'MANAGER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')/g" src/tasks/tasks.controller.ts

# Branches controller - update, deactivate, approve
sed -i "s/@Roles('BOSS')/@Roles('SYSTEM_ADMIN', 'BOSS')/g" src/branches/branches.controller.ts

# Expenses controller - delete
sed -i "s/@Roles('BOSS')/@Roles('SYSTEM_ADMIN', 'BOSS')/g" src/expenses/expenses.controller.ts

# Suppliers controller - all operations
sed -i "s/@Roles('BOSS', 'MANAGER', 'CASHIER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')/g" src/suppliers/suppliers.controller.ts
sed -i "s/@Roles('BOSS', 'MANAGER')/@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')/g" src/suppliers/suppliers.controller.ts

# Purchase orders - approve
sed -i "s/@Roles('BOSS')/@Roles('SYSTEM_ADMIN', 'BOSS')/g" src/purchase-orders/purchase-orders.controller.ts

echo "Done! SYSTEM_ADMIN now has full access to all modules."
