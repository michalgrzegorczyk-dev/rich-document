import { Injectable, inject, QueryList, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ToolbarDimensions } from './dom.models';
import { Position } from '../../ui/toolbar/toolbar.models';

@Injectable({
  providedIn: 'root'
})
export class DomHelper {
  readonly #document = inject(DOCUMENT);
  readonly #focusState = new BehaviorSubject<any>(null);
  readonly #pendingFocus = new BehaviorSubject<number | null>(null);
  #editableDivRefs?: QueryList<ElementRef<HTMLDivElement>>;

  setEditableDivRefs(refs: QueryList<ElementRef<HTMLDivElement>>): void {
    this.#editableDivRefs = refs;
  }

  requestFocus(index: number, options: any = {}): void {
    if (!this.#editableDivRefs || !this.canFocusImmediately(index)) {
      this.#pendingFocus.next(index);
      return;
    }
    this.focusBlock(index, options);
  }

  hasPendingFocus(): boolean {
    return this.#pendingFocus.value !== null;
  }

  getPendingIndex(): number | null {
    return this.#pendingFocus.value;
  }

  focusBlock(index: number, options: any = {}): boolean {
    const element = this.getBlockElement(index);
    if (!element) return false;

    try {
      const { position = 'end', scroll } = options;
      element.focus();

      if (position !== undefined) {
        this.setSelection(element, position);
      }

      if (scroll) {
        this.scrollIntoView(element);
      }
      this.#focusState.next({ position, index });
      this.clearPending();

      return true;
    } catch (error) {
      console.error('Focus operation failed:', error);
      return false;
    }
  }

  private scrollIntoView(element: HTMLElement): void {
    const rect = this.getElementBounds(element);
    const viewport = this.getViewportSize();

    const isVisible =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewport.height &&
      rect.right <= viewport.width;

    if (!isVisible) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }

  private getBlockElement(index: number): HTMLDivElement | null {
    if (!this.#editableDivRefs || !this.isValidIndex(index)) return null;
    return this.#editableDivRefs.get(index)?.nativeElement ?? null;
  }

  private isValidIndex(index: number): boolean {
    return Boolean(
      this.#editableDivRefs &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.#editableDivRefs.length
    );
  }

  private canFocusImmediately(index: number): boolean {
    return Boolean(
      this.#editableDivRefs &&
      this.isValidIndex(index) &&
      this.getBlockElement(index)
    );
  }

  private clearPending(): void {
    this.#pendingFocus.next(null);
  }

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getElementBounds(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  setSelection(element: HTMLElement, position: 'start' | 'end' | number = 'end'): void {
    const range = this.#document.createRange();
    const selection = window.getSelection();

    if (position === 'start') {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    } else if (position === 'end') {
      range.selectNodeContents(element);
      range.collapse(false);
    } else {
      range.setStart(element, Math.min(position, element.textContent?.length ?? 0));
      range.collapse(true);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private readonly toolbarConfig: ToolbarDimensions = {
    width: 200,
    height: 40,
    padding: 16
  };


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
