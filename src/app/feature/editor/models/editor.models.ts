export interface BlockEvent {
  blockId: string;
  type: 'keydown' | 'text-selected' | 'image-clicked';
  event: any;
  index?: number;
}

export interface EditorBlocks {
  blocks: {
    content: string;
    id: string;
  }[];
}

export interface FocusInstruction {
  index: number;
  cursorPosition?: number;
}
