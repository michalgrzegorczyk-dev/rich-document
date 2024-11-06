export interface KeyHandler {
  key: string;
  handle: (event: KeyboardEvent, index: number) => void;
}
