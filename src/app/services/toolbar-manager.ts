// toolbar-manager.service.ts
import { SelectionService } from './selection.service';
import { ToolbarStateService } from './toolbar.service';

export class ToolbarManager {
  constructor(
    private selectionService: SelectionService,
    private toolbarStateService: ToolbarStateService
  ) {}
  //todo: toolbar poczyscic

  handleClick(target: HTMLElement): void {
    if (target.tagName === 'IMG') {
      this.handleImageClick(target as HTMLImageElement);
    } else if (target.closest('pre')) {
      this.handleCodeClick(target.closest('pre') as HTMLElement);
      this.handleTextSelection();
    } else {
      this.handleTextSelection();
    }
  }

  private handleImageClick(image: HTMLImageElement) {
    this.selectionService.unsetSelection();
    const rect = this.selectionService.getElementRect(image);
    const position = this.selectionService.adjustToolbarPosition(rect);
    this.toolbarStateService.showImageToolbar(position);
  }

  private handleCodeClick(codeBlock: HTMLElement) {
    const rect = this.selectionService.getElementRect(codeBlock);
    const position = this.selectionService.adjustToolbarPosition(rect);
    this.toolbarStateService.showCodeToolbar(position);
  }

  private handleTextSelection() {
    if (this.selectionService.hasTextSelection()) {
      const selectionInfo = this.selectionService.getSelectionInfo();
      if (selectionInfo) {
        const position = this.selectionService.adjustToolbarPosition(selectionInfo.rect);
        this.toolbarStateService.showTextToolbar(position);
      }
    }
  }
}
