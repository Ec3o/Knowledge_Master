import { NodeType } from "./knowledge-node";

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
  type: NodeType;
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