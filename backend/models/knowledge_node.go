package models

import (
	"database/sql"
	"time"
)

type KnowledgeNode struct {
	NodeID    string           `json:"id"`
	KBID      string           `json:"-"`
	ParentID  string           `json:"parent_id,omitempty"`
	Type      string           `json:"type"` // folder/file
	Title     string           `json:"name"`
	Content   string           `json:"content,omitempty"`
	Children  []*KnowledgeNode `json:"children,omitempty"` // 添加Children字段
	SortOrder int              `json:"-"`
	CreatedAt time.Time        `json:"-"`
	UpdatedAt time.Time        `json:"-"`
}

// 获取知识库的树形结构
func GetKnowledgeTree(db *sql.DB, kbID string) ([]*KnowledgeNode, error) {
	query := `
		WITH RECURSIVE node_tree AS (
			SELECT 
				node_id, parent_id, node_type, title, content, sort_order,
				0 AS level
			FROM knowledge_nodes
			WHERE kb_id = $1 AND parent_id IS NULL
			
			UNION ALL
			
			SELECT 
				n.node_id, n.parent_id, n.node_type, n.title, n.content, n.sort_order,
				t.level + 1
			FROM knowledge_nodes n
			JOIN node_tree t ON n.parent_id = t.node_id
			WHERE n.kb_id = $1
		)
		SELECT node_id, parent_id, node_type, title, content
		FROM node_tree
		ORDER BY level, sort_order
	`

	rows, err := db.Query(query, kbID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []*KnowledgeNode
	nodeMap := make(map[string]*KnowledgeNode)

	for rows.Next() {
		var node KnowledgeNode
		var parentID sql.NullString
		err := rows.Scan(
			&node.NodeID,
			&parentID,
			&node.Type,
			&node.Title,
			&node.Content,
		)
		if err != nil {
			return nil, err
		}

		if parentID.Valid {
			node.ParentID = parentID.String
		}

		nodeMap[node.NodeID] = &node
		nodes = append(nodes, &node)
	}

	// 构建树形结构
	var rootNodes []*KnowledgeNode
	for _, node := range nodes {
		if node.ParentID == "" {
			rootNodes = append(rootNodes, node)
		} else {
			if parent, ok := nodeMap[node.ParentID]; ok {
				if parent.Children == nil {
					parent.Children = []*KnowledgeNode{}
				}
				parent.Children = append(parent.Children, node)
			}
		}
	}

	return rootNodes, nil
}

// 添加节点
func AddKnowledgeNode(db *sql.DB, kbID string, node *KnowledgeNode) (*KnowledgeNode, error) {
	query := `
		INSERT INTO knowledge_nodes 
		(kb_id, parent_id, node_type, title, content, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING node_id, created_at, updated_at
	`

	var nodeID string
	var createdAt, updatedAt time.Time

	err := db.QueryRow(
		query,
		kbID,
		sql.NullString{String: node.ParentID, Valid: node.ParentID != ""},
		node.Type,
		node.Title,
		node.Content,
		node.SortOrder,
	).Scan(&nodeID, &createdAt, &updatedAt)

	if err != nil {
		return nil, err
	}

	node.NodeID = nodeID
	node.CreatedAt = createdAt
	node.UpdatedAt = updatedAt

	return node, nil
}
