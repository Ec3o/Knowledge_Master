package config

import (
	"database/sql"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	connStr := "user=myuser dbname=mydatabase password=mypassword host=8.154.18.17 port=5432 sslmode=disable"
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}
	return DB.Ping()
}
