# Base stage: Install dependencies and build the project
FROM node:20-alpine AS base
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci  # Installs all dependencies (including dev dependencies)

# Copy the rest of the app and build
COPY . .  
RUN npm run build  # Ensure the TypeScript build succeeds

# Production stage: Use only necessary files
FROM node:20-alpine AS prod
WORKDIR /app

# Copy only package.json and install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built files from the base stage
COPY --from=base /app/build ./build

# Expose port and start the app
EXPOSE 8080
CMD ["npm", "start"]

