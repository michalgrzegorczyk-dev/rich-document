import { Injectable } from '@angular/core';
import { DOMInteractionService, Position, ToolbarDimensions } from './dom-interaction.service';

@Injectable({ providedIn: 'root' })
export class ElementInteractionService extends DOMInteractionService {
  private readonly toolbarConfig: ToolbarDimensions = {
    width: 200,
    height: 40,
    padding: 16
  };

  constructor() {
    super();
  }

  getSelectionInfo() {
    const selection = window.getSelection();
    if (!selection?.toString().trim()) {
      return null;
    }

    return selection.rangeCount > 0 ? {
      range: selection.getRangeAt(0),
      rect: selection.getRangeAt(0).getBoundingClientRect()
    } : null;
  }

  hasTextSelection(): boolean {
    const selection = window.getSelection();
    return Boolean(selection?.toString().trim());
  }

  unsetSelection(): void {
    window.getSelection()?.removeAllRanges();
  }

  adjustToolbarPosition(elementBounds: DOMRect): Position {
    const viewport = this.getViewportSize();
    const { width, height, padding } = this.toolbarConfig;

    return {
      left: this.calculateHorizontalPosition(elementBounds, width, padding, viewport.width),
      top: this.calculateVerticalPosition(elementBounds, height, padding)
    };
  }

  private calculateHorizontalPosition(
    bounds: DOMRect,
    toolbarWidth: number,
    padding: number,
    viewportWidth: number
  ): number {
    let position = bounds.left + (bounds.width / 2) - (toolbarWidth / 2);
    const rightEdge = viewportWidth - toolbarWidth - padding;

    return Math.max(padding, Math.min(position, rightEdge));
  }

  private calculateVerticalPosition(
    bounds: DOMRect,
    toolbarHeight: number,
    padding: number
  ): number {
    const position = bounds.top - toolbarHeight - padding;
    return position < padding ? bounds.bottom + padding : position;
  }
}
