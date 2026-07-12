FROM node:20-slim

# Prisma needs OpenSSL on Debian/slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

# Push schema directly to DB (no migration files needed), seed, then start
CMD npx prisma db push --accept-data-loss && node prisma/seed.js && node src/index.js
