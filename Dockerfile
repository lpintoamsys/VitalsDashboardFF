# Build stage
FROM node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Make sure this creates /app/dist
RUN ls -la /app/dist  # Add this to verify the directory exists

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html