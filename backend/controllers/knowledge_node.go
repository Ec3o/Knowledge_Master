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

// MoveNode 移动节点到新位置
func MoveNode(c *gin.Context) {
	// 获取参数
	kbID := c.Param("kb_id")
	nodeID := c.Param("node_id")
	userID := c.GetString("userID") // 从中间件获取

	// 验证权限
	hasPermission, err := models.CheckKBPermission(config.DB, kbID, userID, 0)
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "failed",
			"message": "没有操作权限",
		})
		return
	}

	// 解析请求体
	var req struct {
		NewParentID string `json:"new_parent_id"` // 空字符串表示根节点
		Position    int    `json:"position"`      // 新位置索引
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "failed",
			"message": "无效的请求参数",
		})
		return
	}

	// 执行移动操作
	if err := models.MoveNode(config.DB, kbID, nodeID, req.NewParentID, req.Position); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "移动节点失败: " + err.Error(),
		})
		return
	}

	// 返回移动后的树结构
	tree, err := models.GetKnowledgeTree(config.DB, kbID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "failed",
			"message": "获取树结构失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "节点移动成功",
		"data":    tree,
	})
}
