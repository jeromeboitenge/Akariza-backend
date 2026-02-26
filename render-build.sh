# Build command
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npm run build

# Start command  
npm run start:prod
