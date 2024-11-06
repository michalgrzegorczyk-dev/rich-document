export interface ToolbarState {
  show: boolean;
  isTextSelection: boolean;
  isImageSelected: boolean;
  isCodeBlock: boolean;
  position: Position;
}

export interface Position {
  top: number;
  left: number;
}
