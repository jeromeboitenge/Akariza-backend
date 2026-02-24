#!/bin/bash

echo "🌱 Running comprehensive database seed..."
echo "This will create:"
echo "  - 2 Organizations"
echo "  - 3 Branches per org"
echo "  - 10+ Users with different roles"
echo "  - 5 Suppliers"
echo "  - 50+ Products"
echo "  - 20+ Customers"
echo "  - 30+ Sales transactions"
echo "  - 15+ Purchase transactions"
echo "  - Promotions, Tasks, Notifications, Messages"
echo ""

# Reset database
npx prisma migrate reset --force --skip-seed

# Run comprehensive seed
npx prisma db seed

echo ""
echo "✅ Database fully seeded!"
echo "🚀 Start the server with: npm run start:dev"
