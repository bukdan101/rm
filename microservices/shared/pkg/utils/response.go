package utils

import "github.com/gofiber/fiber/v3"

// APIResponse standard response
type APIResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message,omitempty"`
	Data    interface{}     `json:"data,omitempty"`
	Meta    *PaginationMeta `json:"meta,omitempty"`
}

// PaginationMeta pagination metadata
type PaginationMeta struct {
	Page      int   `json:"page"`
	PerPage   int   `json:"per_page"`
	Total     int64 `json:"total"`
	TotalPage int   `json:"total_page"`
}

// APIError error response
type APIError struct {
	Success bool                   `json:"success"`
	Message string                 `json:"message"`
	Errors  map[string]interface{} `json:"errors,omitempty"`
}

// SuccessResponse returns success with data
func SuccessResponse(c fiber.Ctx, data interface{}) error {
	return c.JSON(APIResponse{
		Success: true,
		Data:    data,
	})
}

// SuccessMessage returns success with message
func SuccessMessage(c fiber.Ctx, message string) error {
	return c.JSON(APIResponse{
		Success: true,
		Message: message,
	})
}

// SuccessWithData returns success with message and data
func SuccessWithData(c fiber.Ctx, message string, data interface{}) error {
	return c.JSON(APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// PaginatedResponse returns paginated data
func PaginatedResponse(c fiber.Ctx, data interface{}, page, perPage int, total int64) error {
	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}
	return c.JSON(APIResponse{
		Success: true,
		Data:    data,
		Meta: &PaginationMeta{
			Page:      page,
			PerPage:   perPage,
			Total:     total,
			TotalPage: totalPage,
		},
	})
}

// ErrorMsg returns error message
func ErrorMsg(c fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(APIError{
		Success: false,
		Message: message,
	})
}

// ValidationError returns validation error with details
func ValidationError(c fiber.Ctx, message string, errors map[string]interface{}) error {
	return c.Status(fiber.StatusBadRequest).JSON(APIError{
		Success: false,
		Message: message,
		Errors:  errors,
	})
}
