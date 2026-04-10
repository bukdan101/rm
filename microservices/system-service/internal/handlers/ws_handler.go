package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"automarket-system-service/internal/models"
)

// WSHub manages all active WebSocket connections
type WSHub struct {
	// Map of userID -> set of connections
	connections map[uuid.UUID]map[*websocket.Conn]bool
	mu          sync.RWMutex
	db          *gorm.DB
}

// NewWSHub creates a new WebSocket hub
func NewWSHub(db *gorm.DB) *WSHub {
	return &WSHub{
		connections: make(map[uuid.UUID]map[*websocket.Conn]bool),
		db:          db,
	}
}

// Register adds a new connection for a user
func (h *WSHub) Register(userID uuid.UUID, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.connections[userID]; !ok {
		h.connections[userID] = make(map[*websocket.Conn]bool)
	}
	h.connections[userID][conn] = true
	log.Printf("[WS] User %s connected (total connections: %d)", userID, len(h.connections[userID]))
}

// Unregister removes a connection for a user
func (h *WSHub) Unregister(userID uuid.UUID, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if conns, ok := h.connections[userID]; ok {
		delete(conns, conn)
		conn.Close()
		if len(conns) == 0 {
			delete(h.connections, userID)
		}
	}
	log.Printf("[WS] User %s disconnected (remaining connections: %d)", userID, len(h.connections[userID]))
}

// SendToUser sends a message to all connections of a specific user
func (h *WSHub) SendToUser(userID uuid.UUID, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if conns, ok := h.connections[userID]; ok {
		for conn := range conns {
			if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("[WS] Error sending to user %s: %v", userID, err)
			}
		}
	}
}

// SendToUsers sends a message to multiple users
func (h *WSHub) SendToUsers(userIDs []uuid.UUID, message []byte) {
	for _, userID := range userIDs {
		h.SendToUser(userID, message)
	}
}

// IsUserOnline checks if a user has active connections
func (h *WSHub) IsUserOnline(userID uuid.UUID) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()

	conns, ok := h.connections[userID]
	return ok && len(conns) > 0
}

// GetOnlineUserIDs returns all online user IDs
func (h *WSHub) GetOnlineUserIDs() []uuid.UUID {
	h.mu.RLock()
	defer h.mu.RUnlock()

	userIDs := make([]uuid.UUID, 0, len(h.connections))
	for userID := range h.connections {
		userIDs = append(userIDs, userID)
	}
	return userIDs
}

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type           string         `json:"type"`                       // auth, message, read, typing, ping
	Token          string         `json:"token,omitempty"`            // JWT token for auth
	ConversationID string         `json:"conversation_id,omitempty"`  // Target conversation
	Message        string         `json:"message,omitempty"`          // Message text
	MessageType    string         `json:"message_type,omitempty"`     // text, image, file, location
	Metadata       map[string]any `json:"metadata,omitempty"`         // Extra data
}

// WSResponse represents a WebSocket response
type WSResponse struct {
	Type      string      `json:"type"`                // message, read, typing, error, authenticated, notification
	Data      any         `json:"data,omitempty"`      // Response payload
	Timestamp string      `json:"timestamp,omitempty"` // ISO timestamp
	Error     string      `json:"error,omitempty"`     // Error message
}

// VerifyJWT verifies a JWT token and returns the user ID
// In production, this would call the auth service to verify the token
func verifyJWT(token string, jwtSecret string) (uuid.UUID, error) {
	// Parse JWT without verification for development
	// In production, validate against auth service
	if token == "" {
		return uuid.Nil, fmt.Errorf("empty token")
	}

	// Simple JWT parsing for development
	// Replace with proper JWT verification using the auth service
	_, _ = bcrypt.GenerateFromPassword([]byte("dummy"), bcrypt.MinCost) // avoid unused import

	return uuid.Parse(token)
}

// HandleWebSocket handles WebSocket connections
func (h *WSHub) HandleWebSocket(jwtSecret string) func(*websocket.Conn) {
	return func(c *websocket.Conn) {
		var userID uuid.UUID
		authenticated := false

		// Set message handler
		var (
			mt  int
			msg []byte
			err error
		)

		defer func() {
			if authenticated {
				h.Unregister(userID, c)
			}
			c.Close()
		}()

		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				if websocket.IsUnexpectedCloseError(err) {
					log.Printf("[WS] Unexpected close error: %v", err)
				}
				break
			}

			// Parse the message
			var wsMsg WSMessage
			if err := json.Unmarshal(msg, &wsMsg); err != nil {
				resp := WSResponse{Type: "error", Error: "Invalid message format"}
				data, _ := json.Marshal(resp)
				c.WriteMessage(mt, data)
				continue
			}

			switch wsMsg.Type {
			case "auth":
				// Verify JWT token
				parsedUserID, authErr := verifyJWT(wsMsg.Token, jwtSecret)
				if authErr != nil {
					resp := WSResponse{Type: "error", Error: "Authentication failed"}
					data, _ := json.Marshal(resp)
					c.WriteMessage(mt, data)
					continue
				}

				userID = parsedUserID
				authenticated = true
				h.Register(userID, c)

				resp := WSResponse{
					Type:      "authenticated",
					Data:      map[string]string{"user_id": userID.String()},
				}
				data, _ := json.Marshal(resp)
				c.WriteMessage(mt, data)

			case "message":
				if !authenticated {
					sendAuthError(c, mt)
					continue
				}

				// Send message
				err := h.handleChatMessage(userID, &wsMsg)
				if err != nil {
					resp := WSResponse{Type: "error", Error: err.Error()}
					data, _ := json.Marshal(resp)
					c.WriteMessage(mt, data)
				}

			case "read":
				if !authenticated {
					sendAuthError(c, mt)
					continue
				}

				// Mark conversation as read
				err := h.handleReadReceipt(userID, &wsMsg)
				if err != nil {
					resp := WSResponse{Type: "error", Error: err.Error()}
					data, _ := json.Marshal(resp)
					c.WriteMessage(mt, data)
				}

			case "ping":
				resp := WSResponse{Type: "pong"}
				data, _ := json.Marshal(resp)
				c.WriteMessage(mt, data)

			default:
				resp := WSResponse{Type: "error", Error: fmt.Sprintf("Unknown message type: %s", wsMsg.Type)}
				data, _ := json.Marshal(resp)
				c.WriteMessage(mt, data)
			}
		}
	}
}

// handleChatMessage processes an incoming chat message
func (h *WSHub) handleChatMessage(senderID uuid.UUID, wsMsg *WSMessage) error {
	conversationID, err := uuid.Parse(wsMsg.ConversationID)
	if err != nil {
		return fmt.Errorf("invalid conversation_id")
	}

	// Fetch conversation to get the other participant
	var conversation models.Conversation
	if err := h.db.Where("id = ?", conversationID).First(&conversation).Error; err != nil {
		return fmt.Errorf("conversation not found")
	}

	// Verify sender is part of the conversation
	if conversation.BuyerID != senderID && conversation.SellerID != senderID {
		return fmt.Errorf("not authorized to send messages in this conversation")
	}

	// Check conversation is active
	if conversation.Status != "active" {
		return fmt.Errorf("conversation is %s", conversation.Status)
	}

	// Determine message type
	msgType := wsMsg.MessageType
	if msgType == "" {
		msgType = "text"
	}

	// Create message
	message := models.Message{
		ConversationID: conversationID,
		SenderID:       senderID,
		Message:        wsMsg.Message,
		MessageType:    msgType,
		Metadata:       wsMsg.Metadata,
	}

	if err := h.db.Create(&message).Error; err != nil {
		return fmt.Errorf("failed to save message: %v", err)
	}

	// Update conversation
	now := message.CreatedAt
	conversation.LastMessage = wsMsg.Message
	if len(conversation.LastMessage) > 100 {
		conversation.LastMessage = conversation.LastMessage[:100]
	}
	conversation.LastMessageAt = &now
	conversation.LastMessageBy = &senderID

	// Increment unread count for the other party
	if senderID == conversation.BuyerID {
		conversation.SellerUnread++
	} else {
		conversation.BuyerUnread++
	}

	h.db.Save(&conversation)

	// Determine recipient
	var recipientID uuid.UUID
	if senderID == conversation.BuyerID {
		recipientID = conversation.SellerID
	} else {
		recipientID = conversation.BuyerID
	}

	// Build response
	resp := WSResponse{
		Type: "message",
		Data: map[string]any{
			"id":             message.ID.String(),
			"conversation_id": message.ConversationID.String(),
			"sender_id":      message.SenderID.String(),
			"message":        message.Message,
			"message_type":   message.MessageType,
			"metadata":       message.Metadata,
			"created_at":     message.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	}

	// Send to sender (confirmation)
	senderResp, _ := json.Marshal(resp)
	h.SendToUser(senderID, senderResp)

	// Send to recipient if online
	h.SendToUser(recipientID, senderResp)

	return nil
}

// handleReadReceipt processes a read receipt
func (h *WSHub) handleReadReceipt(userID uuid.UUID, wsMsg *WSMessage) error {
	conversationID, err := uuid.Parse(wsMsg.ConversationID)
	if err != nil {
		return fmt.Errorf("invalid conversation_id")
	}

	// Fetch conversation
	var conversation models.Conversation
	if err := h.db.Where("id = ?", conversationID).First(&conversation).Error; err != nil {
		return fmt.Errorf("conversation not found")
	}

	// Determine which side to clear
	if userID == conversation.BuyerID {
		h.db.Model(&conversation).Update("buyer_unread", 0)
	} else if userID == conversation.SellerID {
		h.db.Model(&conversation).Update("seller_unread", 0)
	}

	// Mark unread messages as read
	h.db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND is_read = ?", conversationID, userID, false).
		Updates(map[string]any{
			"is_read": true,
			"read_at": gorm.Expr("NOW()"),
		})

	// Determine the other party
	var otherUserID uuid.UUID
	if userID == conversation.BuyerID {
		otherUserID = conversation.SellerID
	} else {
		otherUserID = conversation.BuyerID
	}

	// Notify the other party about read receipt
	resp := WSResponse{
		Type: "read",
		Data: map[string]string{
			"conversation_id": conversationID.String(),
			"read_by":         userID.String(),
		},
	}
	readResp, _ := json.Marshal(resp)
	h.SendToUser(otherUserID, readResp)

	return nil
}

func sendAuthError(c *websocket.Conn, mt int) {
	resp := WSResponse{Type: "error", Error: "Not authenticated. Send auth message first."}
	data, _ := json.Marshal(resp)
	c.WriteMessage(mt, data)
}
