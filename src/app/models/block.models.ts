import { BlockType } from './types';

export interface Block {
  id: number;
  type: BlockType;
  content: string;
}

export interface BlockEvent {
  type: BlockType;
  content: string;
  index: number;
}
