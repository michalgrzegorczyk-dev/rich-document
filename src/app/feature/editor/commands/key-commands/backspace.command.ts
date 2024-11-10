import { EditorCommand } from '../command.interface';
import { EditorService } from '../../editor.service';

export class BackspaceCommand implements EditorCommand {
  constructor(private editorService: EditorService) {
  }

  execute(event: KeyboardEvent, index: number, target: HTMLElement): void {
    console.log('backspace command');
    // check if block is image
    const image = target.querySelector('img');
    if (image) {
      console.log('if IMAGE', index)
      event.preventDefault();
      this.editorService.removeEmptyBlock(index);
      console.log('block is image')
      return;
    }
    if (this.isBlockEmpty(target) && index > 0) {
      event.preventDefault();
      this.editorService.removeEmptyBlock(index);
    } else {
      const selection = window.getSelection();
      if (selection && this.editorService.isCursorAtStart(target, selection.getRangeAt(0)) && index > 0) {
        event.preventDefault();
        this.editorService.mergeWithPreviousBlock(index);
      }
    }
  }

  isBlockEmpty(element: HTMLElement): boolean {
    return !element.textContent?.trim() && !element.querySelector('img');
  }
}
