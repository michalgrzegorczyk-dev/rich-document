export interface EditorCommand {
  execute(event: KeyboardEvent, index: number, target: HTMLElement): void;
}
