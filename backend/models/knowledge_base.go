package models

import (
	"database/sql"
	"fmt"
	"time"
)

type KnowledgeBase struct {
	KBID              string    `json:"kb_id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	OwnerID           string    `json:"owner_id"`
	IsPublic          bool      `json:"is_public"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	CoverImageURL     string    `json:"cover_image_url"`
	CollaborationMode string    `json:"collaboration_mode"`
}

// 创建知识库
func CreateKnowledgeBase(db *sql.DB, name, description, ownerID string) (*KnowledgeBase, error) {
	query := `
		INSERT INTO knowledge_bases 
		(name, description, owner_id) 
		VALUES ($1, $2, $3)
		RETURNING kb_id, name, description, owner_id, created_at, updated_at
	`

	var kb KnowledgeBase
	err := db.QueryRow(query, name, description, ownerID).Scan(
		&kb.KBID,
		&kb.Name,
		&kb.Description,
		&kb.OwnerID,
		&kb.CreatedAt,
		&kb.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// 自动添加创建者为OWNER
	_, err = db.Exec(
		"INSERT INTO kb_members (kb_id, user_id, role) VALUES ($1, $2, 'OWNER')",
		kb.KBID,
		ownerID,
	)
	if err != nil {
		return nil, err
	}

	return &kb, nil
}

// 获取用户的知识库列表
func GetUserKnowledgeBases(db *sql.DB, userID string) ([]KnowledgeBase, error) {
	query := `
		SELECT k.kb_id, k.name, k.description, k.owner_id, k.created_at, k.updated_at
		FROM knowledge_bases k
		LEFT JOIN kb_members m ON k.kb_id = m.kb_id
		WHERE k.owner_id = $1 OR m.user_id = $1
		ORDER BY k.updated_at DESC
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var kbs []KnowledgeBase
	for rows.Next() {
		var kb KnowledgeBase
		err := rows.Scan(
			&kb.KBID,
			&kb.Name,
			&kb.Description,
			&kb.OwnerID,
			&kb.CreatedAt,
			&kb.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		kbs = append(kbs, kb)
	}

	return kbs, nil
}

func GetKnowledgeBaseById(db *sql.DB, kbID string) (*KnowledgeBase, error) {
	query := `
        SELECT k.kb_id, k.name, k.description, k.owner_id, k.created_at, k.updated_at
        FROM knowledge_bases k
        WHERE k.kb_id = $1
        ORDER BY k.updated_at DESC
    `
	rows, err := db.Query(query, kbID)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	// 检查是否有结果
	if !rows.Next() {
		return nil, fmt.Errorf("knowledge base not found with id: %s", kbID)
	}

	var kb KnowledgeBase
	err = rows.Scan(
		&kb.KBID,
		&kb.Name,
		&kb.Description,
		&kb.OwnerID,
		&kb.CreatedAt,
		&kb.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("scan failed: %w", err)
	}

	// 检查是否有更多行（不应该有，因为kb_id是主键）
	if rows.Next() {
		return nil, fmt.Errorf("multiple knowledge bases found with same id: %s", kbID)
	}

	return &kb, nil
}

// UpdateKnowledgeBase updates the name, description, and owner of a knowledge base
func UpdateKnowledgeBase(db *sql.DB, kbID, name, description, ownerID string) (*KnowledgeBase, error) {
	query := `
        UPDATE knowledge_bases 
        SET name = $1, 
            description = $2, 
            owner_id = $3, 
            updated_at = NOW()
        WHERE kb_id = $4
        RETURNING kb_id, name, description, owner_id, created_at, updated_at
    `

	var kb KnowledgeBase
	err := db.QueryRow(query, name, description, ownerID, kbID).Scan(
		&kb.KBID,
		&kb.Name,
		&kb.Description,
		&kb.OwnerID,
		&kb.CreatedAt,
		&kb.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update knowledge base: %w", err)
	}

	return &kb, nil
}

// DeleteKnowledgeBase deletes a knowledge base by its ID
func DeleteKnowledgeBase(db *sql.DB, kbID string) error {
	// Start a transaction to ensure atomicity
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Delete all members first to maintain referential integrity
	_, err = tx.Exec("DELETE FROM kb_members WHERE kb_id = $1", kbID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete knowledge base members: %w", err)
	}

	// Delete the knowledge base itself
	result, err := tx.Exec("DELETE FROM knowledge_bases WHERE kb_id = $1", kbID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete knowledge base: %w", err)
	}

	// Check if any row was actually deleted
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		tx.Rollback()
		return fmt.Errorf("knowledge base not found with id: %s", kbID)
	}

	// Commit the transaction if everything succeeded
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
