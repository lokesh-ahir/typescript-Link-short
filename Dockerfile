# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
# Copy root src if needed for any reason, but usually dist is enough for production
# COPY .env . (Not recommended for Docker, use env vars instead)

EXPOSE 3000
CMD ["node", "dist/index.js"]
