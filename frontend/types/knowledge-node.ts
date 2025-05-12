export interface KnowledgeNode {
    id: string;
    kb_id?: string;
    parent_id?: string | null;
    type: 'folder' | 'file';
    name: string;
    content?: string;
    children?: KnowledgeNode[];
    created_at?: string;
    updated_at?: string;
  }