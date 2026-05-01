# Build stage
FROM node:20-alpine AS builder

# Enable Corepack for pnpm version management
# Corepack will use the version specified in package.json
RUN corepack enable

WORKDIR /app

# Build arguments
ARG VITE_API_URL=http://localhost:3000

# Copy package files
COPY package.json pnpm-lock.yaml ./

RUN npm config set registry https://mirror2.chabokan.net/npm/

#RUN npm install -g pnpm

# Install dependencies
RUN npm install 
#--frozen-lockfile

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
