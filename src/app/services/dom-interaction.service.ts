import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface Position {
  top: number;
  left: number;
}

export interface ToolbarDimensions {
  width: number;
  height: number;
  padding: number;
}

@Injectable({ providedIn: 'root' })
export class DOMInteractionService {
  protected readonly document = inject(DOCUMENT);

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getElementBounds(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }
}
