import { Injectable } from '@angular/core';
import { DOMInteractionService } from './dom-interaction.service';

@Injectable({ providedIn: 'root' })
export class SelectionManager extends DOMInteractionService {

  setSelection(element: HTMLElement, position: 'start' | 'end' | number = 'end'): void {
    const range = this.document.createRange();
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
}
