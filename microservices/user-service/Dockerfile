# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy shared pkg
COPY ../shared/pkg/ /shared/pkg/

# Copy go.mod and go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /server ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /server /app/server

EXPOSE 8001

CMD ["/app/server"]
