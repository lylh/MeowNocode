# Stage 1: Build the Vite application
FROM node:20-alpine as builder

WORKDIR /app
COPY package.json ./ 
RUN npm config set registry https://registry.npmmirror.com
RUN npm install 
# Add this line to debug:
RUN ls -l node_modules/vite/bin || echo "vite not found in node_modules"

COPY . .
RUN node node_modules/vite/bin/vite.js build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Vite application from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
