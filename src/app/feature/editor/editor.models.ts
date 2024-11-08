export interface BlockEvent {
  type: 'keydown';
  event: KeyboardEvent;
  index: number;
}

export interface EditorBlocks {
  blocks: {
    content: string;
  }[];
}
