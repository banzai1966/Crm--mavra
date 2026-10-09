# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy all project source files
COPY . .

# Compile frontend and bundled server (dist/server.cjs)
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist
# Directory for persistent data volume
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
