# Base stage for building
FROM node:20-alpine3.18 AS base

WORKDIR /app

# Install dependencies first for caching
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine3.18

WORKDIR /app

# Copy only necessary files for production
COPY package*.json ./
RUN npm ci --production

# Copy built files from the base stage
COPY --from=base /app/build ./build

# Expose port
EXPOSE 8080

# Use the start script
CMD ["npm", "start"]
