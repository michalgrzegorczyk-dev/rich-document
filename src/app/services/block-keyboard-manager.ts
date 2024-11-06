import { BlockService } from './block.service';
import { FocusManager } from './focus-manager';
import { QueryList, ElementRef } from '@angular/core';

export interface KeyHandler {
  key: string;
  modifier?: 'shift' | 'ctrl' | 'alt';
  required?: boolean;  // if true, modifier must be present; if false, modifier must not be present
  handle: (event: KeyboardEvent, index: number) => void;
  shouldHandle: (event: KeyboardEvent) => boolean;
}


export class BlockKeyboardManager {
  constructor(
    private readonly blockService: BlockService,
    private readonly focusManager: FocusManager,
    private readonly editableDivRefs: QueryList<ElementRef>
  ) {}

  private readonly keyHandlers: KeyHandler[] = [
    {
      key: 'Enter',
      modifier: 'shift',
      shouldHandle: (event) => !event.shiftKey,  // On
      required: false,
      handle: (event, index) => {
        event.preventDefault();
        this.createBlock(index);
      }
    },
    {
      key: 'Backspace',
      shouldHandle: () => true,  // Always check ba
      handle: (event, index) => {
        console.log('x');
        if (this.isEmptyBlock(index) && this.blockService.blocks().length > 1) {
          event.preventDefault();
          this.deleteBlock(index);
        }
      }
    }
  ];

  handleKeyDown(event: KeyboardEvent, index: number): void {
    const handler = this.findMatchingHandler(event);
    if (handler) {
      handler.handle(event, index);
    }
  }

  private findMatchingHandler(event: KeyboardEvent): KeyHandler | undefined {
    return this.keyHandlers.find(handler =>
      handler.key === event.key && handler.shouldHandle(event)
    );
  }

  private createBlock(index: number): void {
    this.blockService.createBlock();
    this.focusManager.requestFocus(index + 1);
  }

  private deleteBlock(index: number): void {
    if (index > 0) {
      this.blockService.removeBlock(index);
      this.focusManager.requestFocus(index - 1);
    }
  }

  private isEmptyBlock(index: number): boolean {
    const div = this.editableDivRefs.get(index)?.nativeElement;
    return Boolean(div?.textContent?.trim() === '');
  }
}
