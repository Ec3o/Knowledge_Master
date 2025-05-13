export interface KnowledgeNode {
    id: string;
    kb_id?: string;
    parent_id?: string | null;
    type: 'folder' | 'file' | 'concept' | 'formula' | 'algorithm' | 'theorem' | 'example' | 'code_snippet' | 'pseudo_code' | 'code_explanation' | 'reference' | 'video' | 'slide' | 'note' | 'question' | 'custom';
    name: string;
    content?: string;
    children?: KnowledgeNode[];
    created_at?: string;
    updated_at?: string;
  }