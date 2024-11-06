import { ToolbarStateService } from './toolbar.service';
import { Injectable, inject } from '@angular/core';
import { DomHelper } from '../../util/dom/dom-helper';

@Injectable({
  providedIn: 'root'
})
export class ToolbarManager {
  readonly #toolbarStateService = inject(ToolbarStateService);
  readonly #domHelper = inject(DomHelper);

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
    this.#domHelper.unsetSelection();
    const rect = this.#domHelper.getElementBounds(image);
    const position = this.#domHelper.adjustToolbarPosition(rect);
    this.#toolbarStateService.showImageToolbar(position);
  }

  private handleCodeClick(codeBlock: HTMLElement) {
    const rect = this.#domHelper.getElementBounds(codeBlock);
    const position = this.#domHelper.adjustToolbarPosition(rect);
    this.#toolbarStateService.showCodeToolbar(position);
  }

  private handleTextSelection() {
    if (this.#domHelper.hasTextSelection()) {
      const selectionInfo = this.#domHelper.getSelectionInfo();
      if (selectionInfo) {
        const position = this.#domHelper.adjustToolbarPosition(selectionInfo.rect);
        this.#toolbarStateService.showTextToolbar(position);
      }
    }
  }
}
