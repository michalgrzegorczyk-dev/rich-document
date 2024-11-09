import { EditorService } from '../editor.service';
import { EditorCommand } from '../models/command.model';
import { SplitBlockCommand } from './split-block.command';
import { BackspaceCommand } from './backspace.command';
import { ENTER, BACKSPACE } from '../../../util/key.constants';

export class EditorCommandFactory {
  constructor(private editorService: EditorService) {
  }

  getCommand(key: string): EditorCommand | undefined {
    switch (key) {
      case ENTER: {
        return new SplitBlockCommand(this.editorService);
      }
      case BACKSPACE: {
        return new BackspaceCommand(this.editorService);
      }
      default:
        return undefined;
    }
  }
}
