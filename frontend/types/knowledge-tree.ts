import { KnowledgeNode } from './knowledge-node'
export interface KnowledgeTreeResponse {
    id: string
    name: string
    description: string
    treeData: KnowledgeNode[]
  }