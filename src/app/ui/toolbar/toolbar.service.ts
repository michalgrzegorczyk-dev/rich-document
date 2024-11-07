import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, fromEvent, filter } from 'rxjs';
import { ToolbarState, Position } from './toolbar.models';


export const EDITOR_SELECTORS = {
  EDITABLE: '.editable-div',
  TOOLBAR: '.floating-toolbar'
} as const;


const initialToolbarState: ToolbarState = {
  show: false,
  isTextSelection: false,
  isImageSelected: false,
  isCodeBlock: false,
  position: { top: 0, left: 0 }
};

@Injectable({
  providedIn: 'root'
})
export class ToolbarStateService {
  readonly #state = new BehaviorSubject<ToolbarState>(initialToolbarState);
  readonly state$ = this.#state.asObservable();

  readonly #ngZone = inject(NgZone);

  constructor() {
    this.#ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(document, 'click')
        .pipe(filter(event => !this.isClickInside(event.target as Element)))
        .subscribe(() => {
          this.#ngZone.run(() => {
            this.#state.next(initialToolbarState);
          });
        });
    });
  }

  private isClickInside(target: Element): boolean {
    return Boolean(target.closest(EDITOR_SELECTORS.EDITABLE) || target.closest(EDITOR_SELECTORS.TOOLBAR));
  }

  showTextToolbar(position: Position) {
    this.#state.next({
      show: true,
      isTextSelection: true,
      isImageSelected: false,
      isCodeBlock: false,
      position
    });
  }

  showImageToolbar(position: Position) {
    this.#state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: true,
      isCodeBlock: false,
      position
    });
  }

  showCodeToolbar(position: Position) {
    this.#state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: false,
      isCodeBlock: true,
      position
    });
  }
}
