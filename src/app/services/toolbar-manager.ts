import { ToolbarStateService } from './toolbar.service';
import { Injectable, inject } from '@angular/core';
import { ElementInteractionService } from './element-interaction.service';

@Injectable({
  providedIn: 'root'
})
export class ToolbarManager {
  readonly #elementInteraction = inject(ElementInteractionService);
  readonly #toolbarStateService = inject(ToolbarStateService);

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
    this.#elementInteraction.unsetSelection();
    const rect = this.#elementInteraction.getElementRect(image);
    const position = this.#elementInteraction.adjustToolbarPosition(rect);
    this.#toolbarStateService.showImageToolbar(position);
  }

  private handleCodeClick(codeBlock: HTMLElement) {
    const rect = this.#elementInteraction.getElementRect(codeBlock);
    const position = this.#elementInteraction.adjustToolbarPosition(rect);
    this.#toolbarStateService.showCodeToolbar(position);
  }

  private handleTextSelection() {
    if (this.#elementInteraction.hasTextSelection()) {
      const selectionInfo = this.#elementInteraction.getSelectionInfo();
      if (selectionInfo) {
        const position = this.#elementInteraction.adjustToolbarPosition(selectionInfo.rect);
        this.#toolbarStateService.showTextToolbar(position);
      }
    }
  }
}
