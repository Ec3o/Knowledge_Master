package controllers

import (
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"net/http"
)

func GetNodeData(c *gin.Context) {
	kbID := c.Param("kb_id")
	nodeID := c.Param("node_id")
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
	Node, err := models.GetKnowledgeNode(config.DB, kbID, nodeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Successfully queried Knowledge Node",
		"data":    Node,
	})

}

func UpdateNodeData(c *gin.Context) {
	kbID := c.Param("kb_id")
	nodeID := c.Param("node_id")
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
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": "Invalid input",
			"data":    nil,
		})
		return
	}
	updatedNode, err := models.UpdateKnowledgeNode(config.DB, kbID, nodeID, input.Title, input.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Updated Knowledge Node " + nodeID,
		"data":    updatedNode,
	})
}

func DeleteNodeData(c *gin.Context) {
	kbID := c.Param("kb_id")
	nodeID := c.Param("node_id")
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
	err = models.DeleteKnowledgeNode(config.DB, kbID, nodeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": err.Error(),
			"data":    nil,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Deleted Knowledge Node " + nodeID,
		"data":    nil,
	})
}
