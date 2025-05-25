package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"knowledge_master_backend/config"
	"knowledge_master_backend/models"
	"log"
	"net/http"
	"strings"
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
	dragID := c.Param("node_id") // 要移动的节点ID
	userID := c.GetString("userID")

	// 1. 验证权限
	hasPermission, err := models.CheckKBPermission(config.DB, kbID, userID, 0)
	if err != nil {
		log.Printf("权限检查失败 - KB: %s, 用户: %s, 错误: %v", kbID, userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "权限验证服务不可用",
		})
		return
	}
	if !hasPermission {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "denied",
			"message": "没有修改知识库的权限",
		})
		return
	}

	// 2. 解析请求体
	var req struct {
		TargetID string `json:"target_id"` // 目标节点ID
		Position string `json:"position"`  // 位置类型: before/after/inside
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "invalid",
			"message": "请求参数格式错误: " + err.Error(),
		})
		return
	}

	// 3. 验证位置参数
	validPositions := map[string]bool{"before": true, "after": true, "inside": true}
	if !validPositions[req.Position] {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "invalid",
			"message": "position参数必须是 before/after/inside 之一",
		})
		return
	}

	// 4. 执行移动操作
	if err := models.MoveNode(config.DB, kbID, dragID, req.TargetID, req.Position); err != nil {
		log.Printf("节点移动失败 - KB: %s, 节点: %s, 目标: %s, 位置: %s, 错误: %v",
			kbID, dragID, req.TargetID, req.Position, err)

		status := http.StatusInternalServerError
		errorMsg := err.Error()

		// 对特定错误提供更友好的提示
		if strings.Contains(errorMsg, "converting NULL") {
			errorMsg = "系统数据处理错误，请联系管理员"
		} else if strings.Contains(errorMsg, "cannot move") {
			status = http.StatusBadRequest
		}

		c.JSON(status, gin.H{
			"status":  "failed",
			"message": errorMsg,
		})
		return
	}

	// 5. 获取更新后的树结构
	tree, err := models.GetKnowledgeTree(config.DB, kbID)
	if err != nil {
		log.Printf("获取树结构失败 - KB: %s, 错误: %v", kbID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "partial_success",
			"message": "节点移动成功，但获取最新结构失败",
			"data":    nil,
		})
		return
	}

	// 6. 记录成功日志
	log.Printf("节点移动成功 - KB: %s, 节点: %s → 目标: %s (%s)",
		kbID, dragID, req.TargetID, req.Position)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": fmt.Sprintf("节点已成功移动到 %s %s",
			map[string]string{
				"before": "前",
				"after":  "后",
				"inside": "内",
			}[req.Position],
			req.TargetID),
		"data": tree,
	})
}
