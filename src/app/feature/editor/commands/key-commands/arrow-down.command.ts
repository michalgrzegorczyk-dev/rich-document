import { EditorCommand } from '../command.interface';
import { EditorService } from '../../editor.service';

export class ArrowDownCommand implements EditorCommand {
  constructor(private editorService: EditorService) {}

  execute(event: KeyboardEvent, index: number, target: HTMLElement): void {
    this.editorService.moveFocusDown(index);
    event.preventDefault();
  }
}
