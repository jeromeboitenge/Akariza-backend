FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema BEFORE npm install
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# List dist directory to debug
RUN ls -la dist/

# Expose port
EXPOSE 5000

# Start the application
CMD sh -c "npx prisma migrate deploy && node dist/src/main.js"
