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

func MoveNode(db *sql.DB, kbID string, dragID string, hoverID string, position string) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. 获取拖动节点和悬停节点的信息
	var dragNode struct {
		NodeID    string
		ParentID  sql.NullString
		SortOrder int
	}

	if err := tx.QueryRow(
		"SELECT node_id, parent_id, sort_order FROM knowledge_nodes WHERE kb_id = $1 AND node_id = $2",
		kbID, dragID,
	).Scan(&dragNode.NodeID, &dragNode.ParentID, &dragNode.SortOrder); err != nil {
		return fmt.Errorf("failed to get drag node: %w", err)
	}

	var hoverNode struct {
		NodeID   string
		ParentID sql.NullString
		Type     string
	}

	if err := tx.QueryRow(
		"SELECT node_id, parent_id, node_type FROM knowledge_nodes WHERE kb_id = $1 AND node_id = $2",
		kbID, hoverID,
	).Scan(&hoverNode.NodeID, &hoverNode.ParentID, &hoverNode.Type); err != nil {
		return fmt.Errorf("failed to get hover node: %w", err)
	}

	// 2. 检查移动有效性
	if dragID == hoverID {
		return fmt.Errorf("cannot move node to itself")
	}

	if isDescendant(tx, kbID, dragID, hoverID) {
		return fmt.Errorf("cannot move a node into its own descendant")
	}

	// 3. 处理不同类型的移动
	switch position {
	case "before", "after":
		// 先移动父级到与悬停节点相同
		newParentID := hoverNode.ParentID
		if newParentID.Valid {
			_, err = tx.Exec(`
                UPDATE knowledge_nodes
                SET parent_id = $1, updated_at = NOW()
                WHERE kb_id = $2 AND node_id = $3`,
				newParentID.String, kbID, dragID,
			)
		} else {
			_, err = tx.Exec(`
                UPDATE knowledge_nodes
                SET parent_id = NULL, updated_at = NOW()
                WHERE kb_id = $1 AND node_id = $2`,
				kbID, dragID,
			)
		}
		if err != nil {
			return fmt.Errorf("failed to update node parent: %w", err)
		}

		// 然后处理排序
		if err := moveAdjacent(tx, kbID, dragID, hoverID, position); err != nil {
			return err
		}

	case "inside":
		if hoverNode.Type != "folder" {
			return fmt.Errorf("can only move nodes into folders")
		}
		if err := moveIntoFolder(tx, kbID, dragID, hoverID); err != nil {
			return err
		}
	default:
		return fmt.Errorf("invalid position type: %s", position)
	}

	// 4. 提交事务
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// 移动到相邻位置 (before/after)
func moveAdjacent(tx *sql.Tx, kbID, dragID, hoverID, position string) error {
	// 获取悬停节点的父ID
	var hoverParentID sql.NullString
	err := tx.QueryRow(
		"SELECT parent_id FROM knowledge_nodes WHERE kb_id = $1 AND node_id = $2",
		kbID, hoverID,
	).Scan(&hoverParentID)
	if err != nil {
		return fmt.Errorf("failed to get hover node parent: %w", err)
	}

	// 获取兄弟节点当前排序
	var siblings []struct {
		NodeID    string
		SortOrder int
	}

	var rows *sql.Rows
	if hoverParentID.Valid {
		rows, err = tx.Query(`
            SELECT node_id, sort_order 
            FROM knowledge_nodes 
            WHERE kb_id = $1 AND parent_id = $2
            ORDER BY sort_order`,
			kbID, hoverParentID.String,
		)
	} else {
		rows, err = tx.Query(`
            SELECT node_id, sort_order 
            FROM knowledge_nodes 
            WHERE kb_id = $1 AND parent_id IS NULL
            ORDER BY sort_order`,
			kbID,
		)
	}
	if err != nil {
		return fmt.Errorf("failed to query siblings: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var node struct {
			NodeID    string
			SortOrder int
		}
		if err := rows.Scan(&node.NodeID, &node.SortOrder); err != nil {
			return fmt.Errorf("failed to scan sibling: %w", err)
		}
		siblings = append(siblings, node)
	}

	// 计算新sort_order
	var newOrder int
	found := false
	for i, sib := range siblings {
		if sib.NodeID == hoverID {
			found = true
			switch position {
			case "before":
				if i == 0 {
					// 如果是第一个节点，则设置比它小的order
					newOrder = sib.SortOrder - 1
				} else {
					// 否则取前一个节点和当前节点的中间值
					newOrder = (siblings[i-1].SortOrder + sib.SortOrder) / 2
				}
			case "after":
				if i == len(siblings)-1 {
					// 如果是最后一个节点，则设置比它大的order
					newOrder = sib.SortOrder + 1
				} else {
					// 否则取当前节点和后一个节点的中间值
					newOrder = (sib.SortOrder + siblings[i+1].SortOrder) / 2
				}
			}
			break
		}
	}

	if !found {
		return fmt.Errorf("hover node not found in siblings")
	}

	// 更新节点位置
	_, err = tx.Exec(`
        UPDATE knowledge_nodes
        SET sort_order = $1, updated_at = NOW()
        WHERE kb_id = $2 AND node_id = $3`,
		newOrder, kbID, dragID,
	)
	if err != nil {
		return fmt.Errorf("failed to update node position: %w", err)
	}

	// 如果order值空间不足，重新排序
	if newOrder <= 0 || (len(siblings) > 0 && newOrder <= siblings[0].SortOrder) {
		if err := reorderSiblings(tx, kbID, hoverParentID); err != nil {
			return fmt.Errorf("failed to reorder siblings: %w", err)
		}
	}

	return nil
}

// 移动到文件夹内
func moveIntoFolder(tx *sql.Tx, kbID, dragID, hoverID string) error {
	// 获取目标文件夹的子节点最大sort_order
	var maxOrder int
	err := tx.QueryRow(`
        SELECT COALESCE(MAX(sort_order), 0) + 1 
        FROM knowledge_nodes 
        WHERE kb_id = $1 AND parent_id = $2`,
		kbID, hoverID,
	).Scan(&maxOrder)
	if err != nil {
		return fmt.Errorf("failed to get max sort order: %w", err)
	}

	// 更新节点
	_, err = tx.Exec(`
        UPDATE knowledge_nodes
        SET parent_id = $1, sort_order = $2, updated_at = NOW()
        WHERE kb_id = $3 AND node_id = $4`,
		hoverID, maxOrder, kbID, dragID,
	)
	return err
}

// 检查是否是后代节点
func isDescendant(tx *sql.Tx, kbID, parentID, childID string) bool {
	query := `
        WITH RECURSIVE node_tree AS (
            SELECT node_id, parent_id
            FROM knowledge_nodes
            WHERE kb_id = $1 AND node_id = $2
            
            UNION ALL
            
            SELECT n.node_id, n.parent_id
            FROM knowledge_nodes n
            JOIN node_tree t ON n.parent_id = t.node_id
            WHERE n.kb_id = $1
        )
        SELECT EXISTS(SELECT 1 FROM node_tree WHERE node_id = $3)
    `

	var exists bool
	err := tx.QueryRow(query, kbID, parentID, childID).Scan(&exists)
	return err == nil && exists
}

// 获取兄弟节点（事务内）
func getSiblingsInTx(tx *sql.Tx, kbID, parentID string) ([]struct {
	NodeID    string
	SortOrder int
}, error) {
	// Build query based on whether we're looking for root nodes or children
	var query string
	var args []interface{}

	if parentID == "" {
		// Query for root nodes (parent_id IS NULL)
		query = `
            SELECT node_id, sort_order 
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id IS NULL
            ORDER BY sort_order
        `
		args = []interface{}{kbID}
	} else {
		// Query for child nodes (parent_id = $2)
		query = `
            SELECT node_id, sort_order 
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id = $2
            ORDER BY sort_order
        `
		args = []interface{}{kbID, parentID}
	}

	rows, err := tx.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query siblings: %w", err)
	}
	defer rows.Close()

	var siblings []struct {
		NodeID    string
		SortOrder int
	}

	for rows.Next() {
		var node struct {
			NodeID    string
			SortOrder int
		}
		if err := rows.Scan(&node.NodeID, &node.SortOrder); err != nil {
			return nil, fmt.Errorf("failed to scan sibling row: %w", err)
		}
		siblings = append(siblings, node)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return siblings, nil
}

// 重新排序兄弟节点
func reorderSiblings(tx *sql.Tx, kbID string, parentID sql.NullString) error {
	var err error
	if parentID.Valid {
		_, err = tx.Exec(`
            WITH sorted AS (
                SELECT node_id, ROW_NUMBER() OVER (ORDER BY sort_order) * 100 AS new_order
                FROM knowledge_nodes
                WHERE kb_id = $1 AND parent_id = $2
            )
            UPDATE knowledge_nodes n
            SET sort_order = s.new_order
            FROM sorted s
            WHERE n.node_id = s.node_id AND n.kb_id = $1`,
			kbID, parentID.String,
		)
	} else {
		_, err = tx.Exec(`
            WITH sorted AS (
                SELECT node_id, ROW_NUMBER() OVER (ORDER BY sort_order) * 100 AS new_order
                FROM knowledge_nodes
                WHERE kb_id = $1 AND parent_id IS NULL
            )
            UPDATE knowledge_nodes n
            SET sort_order = s.new_order
            FROM sorted s
            WHERE n.node_id = s.node_id AND n.kb_id = $1`,
			kbID,
		)
	}
	return err
}

// GetSiblingNodes 获取同级节点（按sort_order排序）
func GetSiblingNodes(db *sql.DB, kbID, parentID string) ([]*KnowledgeNode, error) {
	// Build query based on whether we're looking for root nodes or children
	var query string
	var args []interface{}

	if parentID == "" {
		// Query for root nodes (parent_id IS NULL)
		query = `
            SELECT node_id, parent_id, node_type, title, content, sort_order
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id IS NULL
            ORDER BY sort_order
        `
		args = []interface{}{kbID}
	} else {
		// Query for child nodes (parent_id = $2)
		query = `
            SELECT node_id, parent_id, node_type, title, content, sort_order
            FROM knowledge_nodes
            WHERE kb_id = $1 AND parent_id = $2
            ORDER BY sort_order
        `
		args = []interface{}{kbID, parentID}
	}

	rows, err := db.Query(query, args...)
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

		// Handle null parent_id - set to empty string for consistency
		node.ParentID = ""
		if parentID.Valid {
			node.ParentID = parentID.String
		}
		nodes = append(nodes, &node)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return nodes, nil
}
