package models

import (
	"database/sql"
	"fmt"
)

type User struct {
	UserID   string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

type UserProfile struct {
	UserID      string `json:"id"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	Description string `json:"description"`
	Website     string `json:"website"`
	AvatarURI   string `json:"avatar_uri"`
}

func CreateUser(db *sql.DB, email, password, username string) (*User, error) {
	query := `INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING user_id`
	var user_id string
	err := db.QueryRow(query, email, password, username).Scan(&user_id)
	if err != nil {
		return nil, err
	}
	return &User{UserID: user_id, Email: email, Username: username}, nil
}

func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	query := `SELECT user_id, email, password_hash, username FROM users WHERE email = $1`
	row := db.QueryRow(query, email)
	user := &User{}
	err := row.Scan(&user.UserID, &user.Email, &user.Password, &user.Username)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByID(db *sql.DB, userID string) (*User, error) {
	query := `
		SELECT user_id, email, username 
		FROM users 
		WHERE user_id = $1
	`
	row := db.QueryRow(query, userID)

	user := &User{}
	err := row.Scan(&user.UserID, &user.Email, &user.Username)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetUserProfile(db *sql.DB, userID string) (*UserProfile, error) {
	query := `
		SELECT user_id, username, description,website,avatar_uri
		FROM user_profiles 
		WHERE user_id = $1
	`
	row := db.QueryRow(query, userID)
	Profile := &UserProfile{}
	err := row.Scan(&Profile.UserID, &Profile.Username, &Profile.Description, &Profile.Website, &Profile.AvatarURI)
	if err != nil {
		return nil, err
	}
	return Profile, nil
}

func UpdateUserProfile(db *sql.DB, userID string, user *UserProfile) error {
	query := `
        UPDATE user_profiles
        SET 
            username = $1,
            description = $2,
            website = $3,
            avatar_uri = $4
        WHERE user_id = $5
    `

	_, err := db.Exec(
		query,
		user.Username,
		user.Description,
		user.Website,
		user.AvatarURI,
		userID,
	)

	if err != nil {
		return fmt.Errorf("failed to update user profile: %w", err)
	}

	return nil
}
