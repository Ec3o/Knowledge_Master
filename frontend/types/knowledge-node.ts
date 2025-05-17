import { BookOpen, Code, Cpu, File, Folder, GraduationCap,Fingerprint,Lightbulb, Puzzle, Sigma, SquarePen, Workflow,BookMarked } from "lucide-react";

export type NodeType = 
  "file"
  | "folder" 
  | "knowledge" 
  | "example" 
  | "formula" 
  | "algorithm" 
  | "concept"
  | "theory" 
  | "procedure" 
  | "data" 
  | "code" 
  | "exercise" 
  | "resource";

export const nodeTypeMap: Record<NodeType, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; name: string }> = {
  file: { icon: File, name: "文件" },
  folder: { icon: Folder, name: "文件夹" },
  knowledge: { icon: BookOpen, name: "知识点" },
  example: { icon: SquarePen, name: "例题" },
  formula: { icon: Fingerprint, name: "公式" },
  algorithm: { icon: Sigma, name: "算法" },
  concept: { icon: Lightbulb, name: "概念" },
  theory: { icon: GraduationCap, name: "理论" },
  procedure: { icon: Workflow, name: "流程" },
  data: { icon: Cpu, name: "数据" },
  code: { icon: Code, name: "代码" },
  exercise: { icon: BookMarked, name: "习题" },
  resource: { icon: Puzzle, name: "资源" },
};
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