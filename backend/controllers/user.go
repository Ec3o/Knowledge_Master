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

func GetUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "Authentication failed",
			Data:    nil,
		})
	}
	profile, err := models.GetUserProfile(config.DB, userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, apiResponse{
			Status:  "failed",
			Message: "User not found",
			Data:    nil,
		})
	}
	c.JSON(http.StatusOK, apiResponse{
		Status:  "success",
		Message: "User successfully retrieved",
		Data:    profile,
	})
}

func UpdateUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "Authentication failed",
			Data:    nil,
		})
	}
	NewProfile := models.UserProfile{}
	err := c.BindJSON(&NewProfile)
	if err != nil {
		c.JSON(http.StatusBadRequest, apiResponse{
			Status:  "failed",
			Message: "Invalid request body",
			Data:    nil,
		})
	}
	err = models.UpdateUserProfile(config.DB, userID.(string), &NewProfile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "User profile update failed",
			Data:    nil,
		})
	}
	c.JSON(http.StatusOK, apiResponse{
		Status:  "success",
		Message: "User successfully updated",
		Data:    nil,
	})
}

func UploadAvatar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, apiResponse{
			Status:  "failed",
			Message: "Authentication failed",
			Data:    nil,
		})
	}

}
