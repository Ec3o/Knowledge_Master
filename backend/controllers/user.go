package controllers

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"net/http"
)

type UserInfoResponse struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	// 可以添加更多不敏感的用户信息字段
}

func GetUserInfo(c *gin.Context) {
	// 从上下文中获取userID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "Authentication failed",
			Data:    nil,
		})
		return
	}

	// 查询用户信息
	user, err := models.GetUserByID(config.DB, userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, apiResponse{
			Status:  "failed",
			Message: "User not found",
			Data:    nil,
		})
		return
	}
	c.JSON(http.StatusOK, apiResponse{
		Status:  "success",
		Message: "User successfully retrieved",
		Data: UserInfoResponse{
			UserID:   user.UserID,
			Username: user.Username,
			Email:    user.Email,
		},
	})
}
