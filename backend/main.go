package main

import (
	"knowledge_master_backend/config"
	"knowledge_master_backend/routes"
	"log"
)

func main() {
	if err := config.InitDB(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	r := routes.SetupRoutes()
	r.Run(":8084") // 默认监听 8080 端口
}
