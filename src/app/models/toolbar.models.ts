import { ToolbarActionType } from './types';

export interface ToolbarState {
  show: boolean;
  isTextSelection: boolean;
  isImageSelected: boolean;
  isCodeBlock: boolean;
  position: Position;
}

export interface ToolbarAction {
  type: ToolbarActionType;
  value: string;
}

export interface Position {
  top: number;
  left: number;
}
