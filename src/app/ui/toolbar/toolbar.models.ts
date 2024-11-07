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

export interface ToolbarActionInput {
  type: string;
  position: Position;
}

export interface ToolbarActionOutput {
  type: string;
  value: string;
}
