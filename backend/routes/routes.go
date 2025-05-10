package routes

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/controllers"
	"knowledge_master_backend/middleware"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()
	controllers.SetupCORS(r)
	auth := r.Group("/api")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}
	server := r.Group("/api")
	server.Use(middleware.AuthMiddleware())
	{
		server.GET("/user/info", controllers.GetUserInfo)
		server.GET("/knowledge-bases", controllers.GetUserKnowledgeBases)
		server.POST("/knowledge-bases", controllers.CreateKnowledgeBase)
		server.GET("/knowledge-bases/:kb_id/tree", controllers.GetKnowledgeTree)
		server.POST("/knowledge-bases/:kb_id/tree", controllers.AddKnowledgeNode)
	}
	return r
}
