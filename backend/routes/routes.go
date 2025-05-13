package routes

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/controllers"
	"knowledge_master_backend/middleware"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()
	controllers.SetupCORS(r)

	public := r.Group("/api")
	{
		public.POST("/register", controllers.Register)
		public.POST("/login", controllers.Login)
	}

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		user := api.Group("/user")
		{
			user.GET("/info", controllers.GetUserInfo)
			user.POST("/avatar", controllers.UploadAvatar)
			user.GET("/profile", controllers.GetUserProfile)
			user.PUT("/profile", controllers.UpdateUserProfile)
		}

		kb := api.Group("/knowledge-bases")
		{
			kb.GET("/", controllers.GetUserKnowledgeBases)
			kb.POST("/", controllers.CreateKnowledgeBase)

			specificKb := kb.Group("/:kb_id")
			{
				specificKb.GET("/", controllers.GetKnowledgeBaseByID)
				specificKb.PUT("/", controllers.UpdateKnowledgeBase)
				specificKb.DELETE("/", controllers.DeleteKnowledgeBase)

				specificKb.GET("/tree", controllers.GetKnowledgeTree)
				specificKb.POST("/tree", controllers.AddKnowledgeNode)

				nodes := specificKb.Group("/nodes")
				{
					nodes.GET("/:node_id", controllers.GetNodeData)
					nodes.PUT("/:node_id", controllers.UpdateNodeData)
					nodes.DELETE("/:node_id", controllers.DeleteNodeData)
				}
			}
		}
	}

	return r
}
