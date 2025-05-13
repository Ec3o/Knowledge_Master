package controllers

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"net/http"
)

// 创建知识库
func CreateKnowledgeBase(c *gin.Context) {
	userID := c.GetString("userID") // 从中间件获取

	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	kb, err := models.CreateKnowledgeBase(config.DB, input.Name, input.Description, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to create knowledge base",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Knowledge base created",
		"data":    kb,
	})
}

// 获取用户的知识库列表
func GetUserKnowledgeBases(c *gin.Context) {
	userID := c.GetString("userID") // 从中间件获取

	kbs, err := models.GetUserKnowledgeBases(config.DB, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to get knowledge bases",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Knowledge bases retrieved",
		"data":    kbs,
	})
}

func GetKnowledgeBaseByID(c *gin.Context) {
	kbID := c.Param("kb_id")
	kb, err := models.GetKnowledgeBaseById(config.DB, kbID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to get knowledge bases",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Knowledge bases retrieved",
		"data":    kb,
	})
}

func UpdateKnowledgeBase(c *gin.Context) {
	kbID := c.Param("kb_id")
	userID := c.GetString("userID")
	hasPermission, err := models.CheckKBPermission(config.DB, kbID, userID, 0)
	if !hasPermission {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "failed",
			"message": "permission denied",
			"data":    nil,
		})
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}
	kb, err := models.UpdateKnowledgeBase(config.DB, kbID, input.Name, input.Description, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to create knowledge base",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Knowledge base modified",
		"data":    kb,
	})
}

func DeleteKnowledgeBase(c *gin.Context) {
	kbID := c.Param("kb_id")
	userID := c.GetString("userID")
	hasPermission, err := models.CheckKBPermission(config.DB, kbID, userID, 0)
	if !hasPermission {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "failed",
			"message": "permission denied",
			"data":    nil,
		})
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	err = models.DeleteKnowledgeBase(config.DB, kbID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Deleted Knowledge Base " + kbID,
		"data":    nil,
	})
}
