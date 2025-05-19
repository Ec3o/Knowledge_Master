export interface KnowledgeBase {
  kb_id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  cover_image_url?: string;
}

export interface KnowledgeNode {
  id: string;
  kb_id?: string;
  parent_id?: string | null;
  type: 'folder' | 'file' | 'concept' | 'formula' | 'algorithm' | 'theorem' | 'example' | 'code_snippet' | 'pseudo_code' | 'code_explanation' | 'reference' | 'video' | 'slide' | 'note' | 'question' | 'custom' | 'root';
  name: string;
  content?: string;
  children?: KnowledgeNode[];
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeTreeResponse {
  data: KnowledgeNode[];
  status: 'success' | 'failed';
}

export type KnowledgeNodeType =
    | "root"
    | "folder"
    | "file"
    | "concept"
    | "formula"
    | "algorithm"
    | "theorem"
    | "example"
    | "code_snippet"
    | "pseudo_code"
    | "code_explanation"
    | "reference"
    | "video"
    | "slide"
    | "note"
    | "question"
    | "custom"