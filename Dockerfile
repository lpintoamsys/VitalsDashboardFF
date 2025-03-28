# Build stage
FROM node:alpine as build
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
# Install dependencies with production flag for optimization
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application with production environment
ENV NODE_ENV=production
RUN npm run build
# Verify build output
RUN ls -la /app/dist

# Production stage
FROM nginx:alpine
# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy NGINX configuration for SPA routing
# This handles client-side routing by redirecting all requests to index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Use non-root user for better security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html
USER appuser

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Document that the container exposes port 80
EXPOSE 80

# Environment variables that can be overridden:
# - None required for the frontend container as it's a static build
# 
# Usage:
# docker build -t vitals-dashboard-frontend .
# docker run -p 8080:80 vitals-dashboard-frontend
# 
# The application will be available at http://localhost:8080
