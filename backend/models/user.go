package models

import (
	"database/sql"
)

type User struct {
	UserID   string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
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
