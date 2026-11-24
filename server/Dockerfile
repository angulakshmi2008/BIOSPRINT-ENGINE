# Production Dockerfile for BioSprint Engine Backend API
FROM node:20-alpine AS base

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source
COPY src ./src

# Create persistent storage directories
RUN mkdir -p data uploads && chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000 \
    DB_FILE=data/biosprint.db \
    UPLOADS_DIR=uploads

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/index.js"]
