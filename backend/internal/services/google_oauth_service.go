package services

import (
        "context"
        "encoding/json"
        "fmt"
        "io"

        "golang.org/x/oauth2"
        "golang.org/x/oauth2/google"
)

type GoogleOAuthService struct {
        config *oauth2.Config
}

type GoogleUserInfo struct {
        ID      string `json:"id"`
        Email   string `json:"email"`
        Name    string `json:"name"`
        Picture string `json:"picture"`
}

func NewGoogleOAuthService(clientID, clientSecret, redirectURL string) *GoogleOAuthService {
        return &GoogleOAuthService{
                config: &oauth2.Config{
                        ClientID:     clientID,
                        ClientSecret: clientSecret,
                        RedirectURL:  redirectURL,
                        Scopes:       []string{"openid", "email", "profile"},
                        Endpoint:     google.Endpoint,
                },
        }
}

func (s *GoogleOAuthService) GetAuthURL(state string) string {
        return s.config.AuthCodeURL(state)
}

func (s *GoogleOAuthService) ExchangeCode(code string) (*GoogleUserInfo, error) {
        token, err := s.config.Exchange(context.Background(), code)
        if err != nil {
                return nil, fmt.Errorf("failed to exchange code: %w", err)
        }

        client := s.config.Client(context.Background(), token)
        resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
        if err != nil {
                return nil, fmt.Errorf("failed to get user info: %w", err)
        }
        defer resp.Body.Close()

        body, err := io.ReadAll(resp.Body)
        if err != nil {
                return nil, fmt.Errorf("failed to read response body: %w", err)
        }

        var userInfo GoogleUserInfo
        if err := json.Unmarshal(body, &userInfo); err != nil {
                return nil, fmt.Errorf("failed to parse user info: %w", err)
        }

        return &userInfo, nil
}
