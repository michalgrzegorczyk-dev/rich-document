export interface ClickStrategy {
  handle(event: MouseEvent, blockId: string): void;
}
