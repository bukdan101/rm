# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod and download dependencies
COPY go.mod .
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /interaction-service ./cmd/server/main.go

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /interaction-service .

EXPOSE 8003

CMD ["./interaction-service"]
