import { EditorCommand } from '../command.interface';
import { EditorService } from '../../editor.service';
import { ToolbarService } from '../../../../ui/toolbar/toolbar.service';

export class EnterCommand implements EditorCommand {
  constructor(private editorService: EditorService, private toolbarService: ToolbarService) {
  }

  execute(event: KeyboardEvent, index: number, target: HTMLElement): void {
    event.preventDefault();
    this.editorService.splitBlock(target, index);
    this.toolbarService.clearToolbar();
  }
}
