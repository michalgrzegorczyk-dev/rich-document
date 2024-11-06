export type BlockType = 'text' | 'image' | 'code';

export interface Block {
  id: number;
  type: BlockType;
  content: string;
}
