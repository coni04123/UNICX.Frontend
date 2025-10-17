# Build stage
FROM node:latest AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:latest AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./


# Conditionally copy public folder
RUN mkdir -p ./public && \
    if [ -d /app/public ]; then cp -r /app/public ./public; fi

# Install production dependencies
RUN npm install --omit=dev

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
