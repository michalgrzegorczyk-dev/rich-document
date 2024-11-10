export interface EditorBlocks {
  blocks: {
    content: string;
    id: string;
    contentEditable: boolean;
    blockType: string;
  }[];
}

export interface FocusInstruction {
  index: number;
  cursorPosition?: number;
}
