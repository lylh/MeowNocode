# Use the official Node.js image as a base image
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) and install dependencies
COPY package.json yarn.lock ./ 
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the React application
RUN yarn build

# Start a new stage for the final image
FROM nginx:alpine

# Copy the built React application from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]