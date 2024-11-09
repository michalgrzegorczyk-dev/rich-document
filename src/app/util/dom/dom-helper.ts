import { Injectable } from '@angular/core';
import { ToolbarDimensions } from './dom.models';
import { Position } from '../../ui/toolbar/toolbar.models';

@Injectable({
  providedIn: 'root'
})
export class DomHelper {

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getElementBounds(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }
  private readonly toolbarConfig: ToolbarDimensions = {
    width: 200,
    height: 40,
    padding: 16
  };

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
