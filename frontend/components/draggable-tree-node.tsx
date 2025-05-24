import { useDrag, useDrop } from "react-dnd"
import { KnowledgeNode } from "@/types/knowledge-node"

interface DragItem {
    id: string
    type: string
    node: KnowledgeNode
  }