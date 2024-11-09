import { EditorCommand } from '../models/command.model';
import { EditorService } from '../editor.service';

export class SplitBlockCommand implements EditorCommand {

  constructor(private editorService: EditorService) {
  }

  execute(event: KeyboardEvent, index: number, target: HTMLElement): void {
    event.preventDefault();
    this.editorService.splitBlock(target, index);
  }
}
