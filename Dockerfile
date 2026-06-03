# --- Stage 1: Build Environment ---
FROM node:18-alpine AS build

# Set a safe, non-root working directory inside the container
WORKDIR /app

# Copy dependency files first to leverage Docker's build cache
COPY package.json ./
# Note: If you have a package-lock.json or yarn.lock, copy it here too
# COPY package-lock.json ./ 

# Install dependencies cleanly
RUN npm install --frozen-lockfile || npm install

# Copy the rest of the application files
COPY . .

# Build the production-ready static assets
RUN npm run build

# --- Stage 2: Production Web Server ---
FROM nginx:alpine

# Copy the static build files from the build stage to Nginx's public directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration to support client-side routing (optional but recommended)
# If you don't use React Router, standard Nginx default configuration works fine.
# For standard deployments, Nginx will run on port 80.
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]