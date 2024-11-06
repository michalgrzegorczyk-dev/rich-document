import { BehaviorSubject } from 'rxjs';
import { Injectable, inject, QueryList, ElementRef } from '@angular/core';
import { DOMInteractionService } from './dom-interaction.service';
import { SelectionManager } from './selection-manager';

export interface FocusOptions {
  position?: 'start' | 'end' | number;
  scroll?: boolean;
  index?: number;
}

@Injectable({ providedIn: 'root' })
export class FocusManager extends DOMInteractionService {
  private readonly selectionManager = inject(SelectionManager);
  private readonly focusState = new BehaviorSubject<FocusOptions | null>(null);
  private readonly pendingFocus = new BehaviorSubject<number | null>(null);
  private editableDivRefs?: QueryList<ElementRef<HTMLDivElement>>;

  setEditableDivRefs(refs: QueryList<ElementRef<HTMLDivElement>>): void {
    this.editableDivRefs = refs;
  }

  requestFocus(index: number, options: FocusOptions = {}): void {
    if (!this.editableDivRefs || !this.canFocusImmediately(index)) {
      this.pendingFocus.next(index);
      return;
    }
    this.focusBlock(index, options);
  }

  hasPendingFocus(): boolean {
    return this.pendingFocus.value !== null;
  }

  getPendingIndex(): number | null {
    return this.pendingFocus.value;
  }

  focusBlock(index: number, options: FocusOptions = {}): boolean {
    const element = this.getBlockElement(index);
    if (!element) return false;

    try {
      const { position = 'end', scroll } = options;
      element.focus();

      if (position !== undefined) {
        this.selectionManager.setSelection(element, position);
      }

      if (scroll) {
        this.scrollIntoView(element);
      }
      this.focusState.next({ position, index });
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
    if (!this.editableDivRefs || !this.isValidIndex(index)) return null;
    return this.editableDivRefs.get(index)?.nativeElement ?? null;
  }

  private isValidIndex(index: number): boolean {
    return Boolean(
      this.editableDivRefs &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.editableDivRefs.length
    );
  }

  private canFocusImmediately(index: number): boolean {
    return Boolean(
      this.editableDivRefs &&
      this.isValidIndex(index) &&
      this.getBlockElement(index)
    );
  }

  private clearPending(): void {
    this.pendingFocus.next(null);
  }
}
