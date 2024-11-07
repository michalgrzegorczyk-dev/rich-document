export interface EditorBlock {
  // id: string;
  // order: number;
  content: string;
}

export interface EditorBlocks {
  blocks: EditorBlock[];
}

export interface BlockEvent {
  type: string;
  blockId: string;
  data?: any;
}
