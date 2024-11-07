import { Injectable, inject } from '@angular/core';
import { DomHelper } from './dom/dom-helper';

export interface SelectionPosition {
  top: number;
  left: number;
}

export interface SelectionInfo {
  type: 'text' | 'img' | 'code';
  position: SelectionPosition;
  content?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private readonly domHelper = inject(DomHelper);

  handleTextSelection(event: MouseEvent): SelectionInfo | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText) return null;

    const rect = this.domHelper.getElementBounds(event.target as HTMLElement);
    const position = this.domHelper.adjustToolbarPosition(rect);

    return {
      type: 'text',
      position,
      content: selectedText
    };
  }

  handleElementClick(event: MouseEvent): SelectionInfo | null {
    const target = event.target as HTMLElement;

    // Handle image click
    if (target.tagName.toLowerCase() === 'img') {
      const rect = this.domHelper.getElementBounds(target);
      const position = this.domHelper.adjustToolbarPosition(rect);
      return {
        type: 'img',
        position,
        content: target.getAttribute('src') || ''
      };
    }

    // Handle code block click
    const codeBlock = target.closest('pre code') || target.closest('pre');
    // if (codeBlock) {
    //   const rect = this.domHelper.getElementBounds(codeBlock);
    //   const position = this.domHelper.adjustToolbarPosition(rect);
    //   return {
    //     type: 'code',
    //     position,
    //     content: codeBlock.textContent || ''
    //   };
    // }

    // Handle inline code click
    const inlineCode = target.closest('code');
    if (inlineCode) {
      const rect = this.domHelper.getElementBounds(inlineCode);
      const position = this.domHelper.adjustToolbarPosition(rect);
      return {
        type: 'code',
        position,
        content: inlineCode.textContent || ''
      };
    }

    return null;
  }
}
