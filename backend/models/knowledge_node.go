package models

import (
	"database/sql"
	"fmt"
	"sort"
	"time"
)

type KnowledgeNode struct {
	NodeID    string           `json:"id"`
	KBID      string           `json:"-"`
	ParentID  string           `json:"parent_id,omitempty"`
	Type      string           `json:"type"` // folder/file
	Title     string           `json:"name"`
	Content   string           `json:"content,omitempty"`
	Children  []*KnowledgeNode `json:"children,omitempty"`
	SortOrder int              `json:"sort_order"` // 改为公开字段
	CreatedAt time.Time        `json:"-"`
	UpdatedAt time.Time        `json:"-"`
}

// 获取知识库的树形结构
func GetKnowledgeTree(db *sql.DB, kbID string) ([]*KnowledgeNode, error) {
	query := `
        WITH RECURSIVE node_tree AS (
            SELECT 
                node_id, parent_id, node_type, title, content, 
                sort_order, created_at, updated_at,
                0 AS level
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id IS NULL
            
            UNION ALL
            
            SELECT 
                n.node_id, n.parent_id, n.node_type, n.title, n.content,
                n.sort_order, n.created_at, n.updated_at,
                t.level + 1
            FROM knowledge_nodes n
            JOIN node_tree t ON n.parent_id = t.node_id
            WHERE n.kb_id = $1
        )
        SELECT * FROM node_tree
        ORDER BY level, parent_id, sort_order
    `

	rows, err := db.Query(query, kbID)
	if err != nil {
		return nil, fmt.Errorf("failed to query tree: %w", err)
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
			&node.SortOrder,
			&node.CreatedAt,
			&node.UpdatedAt,
			new(int), // level (ignored)
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan node: %w", err)
		}

		if parentID.Valid {
			node.ParentID = parentID.String
		}

		nodeMap[node.NodeID] = &node
		nodes = append(nodes, &node)
	}

	// 构建树形结构（保持排序）
	var rootNodes []*KnowledgeNode
	for _, node := range nodes {
		if node.ParentID == "" {
			rootNodes = append(rootNodes, node)
		} else {
			parent, ok := nodeMap[node.ParentID]
			if ok {
				if parent.Children == nil {
					parent.Children = make([]*KnowledgeNode, 0)
				}
				parent.Children = append(parent.Children, node)
			}
		}
	}

	// 对每个父节点的子节点进行排序
	for _, node := range nodeMap {
		if len(node.Children) > 0 {
			sort.Slice(node.Children, func(i, j int) bool {
				return node.Children[i].SortOrder < node.Children[j].SortOrder
			})
		}
	}

	// 对根节点排序
	sort.Slice(rootNodes, func(i, j int) bool {
		return rootNodes[i].SortOrder < rootNodes[j].SortOrder
	})

	return rootNodes, nil
}

// 添加节点
func AddKnowledgeNode(db *sql.DB, kbID string, node *KnowledgeNode) (*KnowledgeNode, error) {
	// 自动计算sort_order
	if node.SortOrder == 0 {
		var maxOrder int
		var err error

		// 区分根节点和非根节点查询
		if node.ParentID == "" {
			err = db.QueryRow(`
                SELECT COALESCE(MAX(sort_order), 0) + 1 
                FROM knowledge_nodes 
                WHERE kb_id = $1 AND parent_id IS NULL`,
				kbID,
			).Scan(&maxOrder)
		} else {
			err = db.QueryRow(`
                SELECT COALESCE(MAX(sort_order), 0) + 1 
                FROM knowledge_nodes 
                WHERE kb_id = $1 AND parent_id = $2`,
				kbID, node.ParentID,
			).Scan(&maxOrder)
		}

		if err != nil {
			return nil, fmt.Errorf("failed to calculate sort order: %w", err)
		}
		node.SortOrder = maxOrder
	}

	query := `
        INSERT INTO knowledge_nodes 
        (kb_id, parent_id, node_type, title, content, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING node_id, created_at, updated_at
    `

	var nodeID string
	var createdAt, updatedAt time.Time

	// 明确处理 parent_id 为空的两种情况
	parentID := sql.NullString{String: node.ParentID, Valid: node.ParentID != ""}

	err := db.QueryRow(
		query,
		kbID,
		parentID,
		node.Type,
		node.Title,
		node.Content,
		node.SortOrder,
	).Scan(&nodeID, &createdAt, &updatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to add node: %w", err)
	}

	node.NodeID = nodeID
	node.CreatedAt = createdAt
	node.UpdatedAt = updatedAt
	return node, nil
}
func GetKnowledgeNode(db *sql.DB, kbID string, nodeID string) (*KnowledgeNode, error) {
	query := `
        SELECT 
            node_id, 
            parent_id, 
            node_type, 
            title, 
            content, 
            sort_order,
            created_at,
            updated_at
        FROM knowledge_nodes
        WHERE kb_id = $1 AND node_id = $2
    `

	var node KnowledgeNode
	var parentID sql.NullString
	err := db.QueryRow(query, kbID, nodeID).Scan(
		&node.NodeID,
		&parentID,
		&node.Type,
		&node.Title,
		&node.Content,
		&node.SortOrder,
		&node.CreatedAt,
		&node.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("knowledge node not found")
		}
		return nil, fmt.Errorf("failed to get knowledge node: %w", err)
	}

	if parentID.Valid {
		node.ParentID = parentID.String
	}

	return &node, nil
}
func UpdateKnowledgeNode(db *sql.DB, kbID, nodeID, title, content string) (*KnowledgeNode, error) {
	query := `
        UPDATE knowledge_nodes
        SET title = $1, 
            content = $2, 
            updated_at = CURRENT_TIMESTAMP
        WHERE kb_id = $3 AND node_id = $4
        RETURNING node_id, kb_id, parent_id, node_type, title, content, sort_order, created_at, updated_at
    `

	var node KnowledgeNode
	err := db.QueryRow(query, title, content, kbID, nodeID).Scan(
		&node.NodeID,
		&node.KBID,
		&node.ParentID,
		&node.Type,
		&node.Title,
		&node.Content,
		&node.SortOrder,
		&node.CreatedAt,
		&node.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to update node: %w", err)
	}

	return &node, nil
}

func CheckKBPermission(db *sql.DB, kbID string, userID string, level int) (bool, error) {
	return true, nil
}

func DeleteKnowledgeNode(db *sql.DB, kbID string, nodeID string) error {
	// 先删除所有子节点
	deleteChildrenQuery := `
        WITH RECURSIVE node_tree AS (
            SELECT node_id
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id = $2
            
            UNION ALL
            
            SELECT n.node_id
            FROM knowledge_nodes n
            JOIN node_tree t ON n.parent_id = t.node_id
            WHERE n.kb_id = $1
        )
        DELETE FROM knowledge_nodes
        WHERE node_id IN (SELECT node_id FROM node_tree)
    `
	_, err := db.Exec(deleteChildrenQuery, kbID, nodeID)
	if err != nil {
		return fmt.Errorf("failed to delete children nodes: %w", err)
	}

	// 再删除当前节点
	deleteNodeQuery := `
        DELETE FROM knowledge_nodes
        WHERE kb_id = $1 AND node_id = $2
    `
	_, err = db.Exec(deleteNodeQuery, kbID, nodeID)
	if err != nil {
		return fmt.Errorf("failed to delete node: %w", err)
	}

	return nil
}

func MoveNode(db *sql.DB, kbID string, nodeID string, newParentID string, newPosition int) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. 获取当前节点信息
	var currentParentID sql.NullString
	var currentSort int
	err = tx.QueryRow(`
        SELECT parent_id, sort_order FROM knowledge_nodes 
        WHERE kb_id = $1 AND node_id = $2 FOR UPDATE`,
		kbID, nodeID,
	).Scan(&currentParentID, &currentSort)
	if err != nil {
		return fmt.Errorf("failed to get current node: %w", err)
	}

	// 2. 获取目标位置的兄弟节点
	var siblings []struct {
		ID    string
		Order int
	}
	rows, err := tx.Query(`
        SELECT node_id, sort_order FROM knowledge_nodes
        WHERE kb_id = $1 AND parent_id IS NOT DISTINCT FROM $2
        ORDER BY sort_order`,
		kbID, newParentID,
	)
	if err != nil {
		return fmt.Errorf("failed to get siblings: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sibling struct {
			ID    string
			Order int
		}
		if err := rows.Scan(&sibling.ID, &sibling.Order); err != nil {
			return fmt.Errorf("failed to scan sibling: %w", err)
		}
		siblings = append(siblings, sibling)
	}

	// 3. 计算新sort_order值
	newOrder := 0
	switch {
	case len(siblings) == 0:
		newOrder = 0
	case newPosition <= 0:
		newOrder = siblings[0].Order
	case newPosition >= len(siblings):
		newOrder = siblings[len(siblings)-1].Order
	default:
		prev := siblings[newPosition-1].Order
		next := siblings[newPosition].Order
		newOrder = (prev + next) / 2
	}

	// 4. 更新节点位置
	_, err = tx.Exec(`
        UPDATE knowledge_nodes
        SET parent_id = $1, sort_order = $2, updated_at = NOW()
        WHERE kb_id = $3 AND node_id = $4`,
		sql.NullString{String: newParentID, Valid: newParentID != ""},
		newOrder,
		kbID,
		nodeID,
	)
	if err != nil {
		return fmt.Errorf("failed to update node position: %w", err)
	}

	// 5. 如果order值空间不足，重新排序
	if newPosition > 0 && newPosition < len(siblings) &&
		(siblings[newPosition].Order-siblings[newPosition-1].Order) <= 1 {
		if err := reorderSiblings(tx, kbID, newParentID); err != nil {
			return fmt.Errorf("failed to reorder siblings: %w", err)
		}
	}

	return tx.Commit()
}

func reorderSiblings(tx *sql.Tx, kbID string, parentID string) error {
	_, err := tx.Exec(`
        WITH sorted AS (
            SELECT node_id, ROW_NUMBER() OVER (ORDER BY sort_order) AS new_order
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id IS NOT DISTINCT FROM $2
        )
        UPDATE knowledge_nodes n
        SET sort_order = s.new_order
        FROM sorted s
        WHERE n.node_id = s.node_id`,
		kbID, parentID,
	)
	return err
}

// GetSiblingNodes 获取同级节点（按sort_order排序）
func GetSiblingNodes(db *sql.DB, kbID, parentID string) ([]*KnowledgeNode, error) {
	query := `
        SELECT node_id, parent_id, node_type, title, content, sort_order
        FROM knowledge_nodes
        WHERE kb_id = $1 AND parent_id IS NOT DISTINCT FROM $2
        ORDER BY sort_order
    `

	rows, err := db.Query(query, kbID, parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to query siblings: %w", err)
	}
	defer rows.Close()

	var nodes []*KnowledgeNode
	for rows.Next() {
		var node KnowledgeNode
		var parentID sql.NullString
		if err := rows.Scan(
			&node.NodeID,
			&parentID,
			&node.Type,
			&node.Title,
			&node.Content,
			&node.SortOrder,
		); err != nil {
			return nil, fmt.Errorf("failed to scan sibling: %w", err)
		}

		if parentID.Valid {
			node.ParentID = parentID.String
		}
		nodes = append(nodes, &node)
	}

	return nodes, nil
}
