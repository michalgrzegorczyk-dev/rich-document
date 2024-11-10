import { EditorService } from '../editor.service';
import { EditorCommand } from './command.interface';
import { EnterCommand } from './key-commands/enter.command';
import { BackspaceCommand } from './key-commands/backspace.command';
import { ENTER, BACKSPACE, ARROW_DOWN, ARROW_UP } from '../../../util/key.constants';
import { Injectable, inject } from '@angular/core';
import { ArrowDownCommand } from './key-commands/arrow-down.command';
import { ArrowUpCommand } from './key-commands/arrow-up.command';
import { ArrowLeftCommand } from './key-commands/arrow-left.commnad';
import { ToolbarService } from '../../../ui/toolbar/toolbar.service';

@Injectable({
  providedIn: 'root'
})
export class EditorCommandFactory {

  editorService = inject(EditorService);
  toolbarService = inject(ToolbarService);

  getCommand(key: string): EditorCommand | undefined {
    switch (key) {
      case ENTER:
        return new EnterCommand(this.editorService, this.toolbarService);
      case BACKSPACE:
        return new BackspaceCommand(this.editorService);
      case ARROW_DOWN:
        return new ArrowDownCommand(this.editorService);
      case ARROW_UP:
        return new ArrowUpCommand(this.editorService);
      case 'ArrowLeft':
        return new ArrowLeftCommand(this.editorService);
      default:
        console.log('no command found');
        return undefined;
    }
  }
}
