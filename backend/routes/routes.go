package routes

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/controllers"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()
	controllers.SetupCORS(r)
	auth := r.Group("/api")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	return r
}
