import { BehaviorSubject } from 'rxjs';
import { QueryList, ElementRef, Injectable, inject } from '@angular/core';
import { ElementInteractionService } from './element-interaction.service';
import { DOCUMENT } from '@angular/common';

interface FocusOptions {
  position?: 'start' | 'end' | number;
  smooth?: boolean;
  preventScroll?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FocusManager {
  private readonly pendingFocusSubject = new BehaviorSubject<number | null>(null);
  private readonly activeBlockSubject = new BehaviorSubject<number | null>(null);
  private editableDivRefs?: QueryList<ElementRef<HTMLDivElement>>;

  private readonly defaultOptions: FocusOptions = {
    position: 'end',
    smooth: true,
    preventScroll: false
  };

  document = inject(DOCUMENT);
  selectionService = inject(ElementInteractionService);

  setEditableDivRefs(refs: QueryList<ElementRef<HTMLDivElement>>) {
    this.editableDivRefs = refs;
  }

  requestFocus(index: number, options: FocusOptions = this.defaultOptions): void {
    if (!this.editableDivRefs) {
      this.pendingFocusSubject.next(index);
      return;
    }

    if (this.canFocusImmediately(index)) {
      this.focusBlock(index, options);
    } else {
      this.pendingFocusSubject.next(index);
    }
  }

  getPendingIndex(): number | null {
    return this.pendingFocusSubject.value;
  }

  hasPendingFocus(): boolean {
    return this.getPendingIndex() !== null;
  }

  clear(): void {
    this.pendingFocusSubject.next(null);
  }

  focusBlock(index: number, options: FocusOptions = this.defaultOptions): boolean {
    try {
      if (!this.editableDivRefs || !this.isValidIndex(index)) {
        console.warn(`Cannot focus block: ${!this.editableDivRefs ? 'Refs not set' : 'Invalid index'}`);
        return false;
      }

      const div = this.getBlockElement(index);
      if (!div) {
        if (!this.hasPendingFocus()) {
          this.pendingFocusSubject.next(index);
        }
        return false;
      }

      const currentFocused = this.document.activeElement;
      if (currentFocused === div) {
        return true;
      }

      this.applyFocus(div, options);
      this.activeBlockSubject.next(index);
      this.clear();

      if (!options.preventScroll) {
        this.scrollIntoView(div, options.smooth);
      }

      return true;
    } catch (error) {
      console.error('Error focusing block:', error);
      return false;
    }
  }

  private canFocusImmediately(index: number): boolean {
    return Boolean(this.editableDivRefs) &&
      this.isValidIndex(index) &&
      Boolean(this.getBlockElement(index));
  }

  private isValidIndex(index: number): boolean {
    return Boolean(
      this.editableDivRefs &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.editableDivRefs.length
    );
  }

  private getBlockElement(index: number): HTMLDivElement | null {
    return this.editableDivRefs?.get(index)?.nativeElement || null;
  }

  private applyFocus(element: HTMLDivElement, options: FocusOptions): void {
    element.focus();

    const { position } = options;
    if (position === 'start') {
    } else if (position === 'end') {
      this.selectionService.focusAtEnd(element);
    } else if (typeof position === 'number') {
    }
  }

  private scrollIntoView(element: HTMLDivElement, smooth: boolean = true): void {
    const rect = element.getBoundingClientRect();
    const isVisible =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || this.document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || this.document.documentElement.clientWidth);

    if (!isVisible) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }
}
