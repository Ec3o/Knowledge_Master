package controllers

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"net/http"
)

// 获取知识库树形结构
func GetKnowledgeTree(c *gin.Context) {
	kbID := c.Param("kb_id")

	nodes, err := models.GetKnowledgeTree(config.DB, kbID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to get knowledge tree",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   nodes,
	})
}

// 添加节点
func AddKnowledgeNode(c *gin.Context) {
	kbID := c.Param("kb_id")
	userID := c.GetString("userID") // 从中间件获取

	var input struct {
		ParentID string `json:"parent_id"`
		Type     string `json:"type" binding:"required,oneof=folder file"`
		Title    string `json:"name" binding:"required"`
		Content  string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	// 验证用户是否有权限操作该知识库
	if !checkKBPermission(kbID, userID) {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "failed",
			"message": "No permission",
		})
		return
	}

	node := &models.KnowledgeNode{
		ParentID: input.ParentID,
		Type:     input.Type,
		Title:    input.Title,
		Content:  input.Content,
	}

	newNode, err := models.AddKnowledgeNode(config.DB, kbID, node)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "Failed to add node",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   newNode,
	})
}

func checkKBPermission(kbID, userID string) bool {
	return true
}
