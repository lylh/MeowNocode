# Use the official Go image as a base image
FROM golang:1.22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./ 
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the PocketBase application
RUN go build -o pocketbase main.go

# Start a new stage for the final image
FROM alpine:latest

# Set the working directory
WORKDIR /app

# Copy the built PocketBase binary from the builder stage
COPY --from=builder /app/pocketbase .
COPY --from=builder /app/pb_migrations ./pb_migrations
COPY --from=builder /app/pb_schema.json .

# Expose the port PocketBase runs on
EXPOSE 8090

# Command to run the PocketBase application
CMD ["./pocketbase", "serve", "--http", "0.0.0.0:8090"]