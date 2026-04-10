# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/system-service ./cmd/server

# Run stage
FROM alpine:latest

WORKDIR /app

# Copy the binary
COPY --from=builder /app/system-service .

# Copy .env file
COPY --from=builder /app/.env .

# Expose port
EXPOSE 8006

# Run the service
CMD ["./system-service"]
