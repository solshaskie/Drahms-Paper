# Multi-stage build for production
FROM node:18-alpine AS base

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm ci && npm run build

# Production stage
FROM node:18-alpine AS production

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base --chown=nextjs:nodejs /app ./

# Create uploads directory
RUN mkdir -p server/uploads && chown -R nextjs:nodejs server/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
