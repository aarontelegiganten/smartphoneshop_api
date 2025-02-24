# Base Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY . .  

# Development Stage
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=base /app /app
RUN npm install --include=dev
CMD ["npm", "run", "dev"]  # Run nodemon in development

# Production Stage
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /app/build ./build
COPY package*.json ./
RUN npm ci --production
CMD ["npm", "start"]
