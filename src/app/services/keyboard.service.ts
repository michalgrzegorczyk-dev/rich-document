import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyHandler {
  key: string;
  handle: (event: KeyboardEvent, index: number) => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {

  readonly enterPressed$ = new Subject<number>();
  readonly backspacePressed$ = new Subject<number>();

  private readonly keyHandlers: KeyHandler[] = [
    {
      key: 'Enter',
      handle: (event, index) => {
        event.preventDefault();
        this.enterPressed$.next(index);
      }
    },
    {
      key: 'Backspace',
      handle: (event, index) => {
        event.preventDefault();
        this.backspacePressed$.next(index);
      }
    }
  ];

  handleKeyDown(event: KeyboardEvent, index: number): void {
    const handler = this.keyHandlers.find(handler => handler.key === event.key);

    if (handler) {
      handler.handle(event, index);
    }
  }
}
