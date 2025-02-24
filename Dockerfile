# Base Stage: Install dependencies and build the project
FROM node:20-alpine AS base
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci  # Install all dependencies (including dev dependencies)

# Copy the rest of the app and build
COPY . .  
RUN npm run build  # Ensure TypeScript compiles the project

# Development Stage (for Local)
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=base /app /app
RUN npm install --include=dev  # Ensure dev dependencies
CMD ["npm", "run", "dev"]  # Runs nodemon for hot reloading

# Production Stage (for Render)
FROM node:20-alpine AS prod
WORKDIR /app

# Copy only necessary files for production
COPY package*.json ./
RUN npm ci --production  # Install only production dependencies

# Copy built files from the base stage
COPY --from=base /app/build ./build

# Expose port and start the app
EXPOSE 8080
CMD ["npm", "start"]



