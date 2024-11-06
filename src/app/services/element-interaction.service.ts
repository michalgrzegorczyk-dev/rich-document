import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElementInteractionService {
  getSelectionInfo(): { range: Range, rect: DOMRect } | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      return { range, rect };
    }
    return null;
  }

  hasTextSelection(): boolean {
    const selection = window.getSelection();
    return !!(selection && selection.toString().trim().length > 0);
  }

  getElementRect(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  adjustToolbarPosition(rect: DOMRect): { top: number; left: number } {
    const toolbarWidth = 200;
    const toolbarHeight = 40;
    const padding = 16;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    let top = rect.top - toolbarHeight - padding;

    if (left + toolbarWidth > viewport.width - padding) {
      left = viewport.width - toolbarWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = rect.bottom + padding;
    }

    return { top, left };
  }

  focusAtEnd(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  unsetSelection() {
    window.getSelection()?.removeAllRanges();
  }

}
