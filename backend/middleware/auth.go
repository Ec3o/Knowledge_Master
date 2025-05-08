package middleware

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/utils"
	"net/http"
	"strings"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从Header获取token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "failed",
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// 检查Bearer token格式
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "failed",
				"message": "Invalid token format",
			})
			c.Abort()
			return
		}

		// 验证token
		userID, err := utils.ParseToken(tokenParts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "failed",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// 将userID存入上下文
		c.Set("userID", userID)
		c.Next()
	}
}
