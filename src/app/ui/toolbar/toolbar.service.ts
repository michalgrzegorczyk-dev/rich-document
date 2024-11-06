import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, fromEvent, filter } from 'rxjs';
import { ToolbarState } from './toolbar.models';
import { EDITOR_SELECTORS } from '../../feature/editor/editor.component';

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
            this.hideToolbar();
          })
        });
    })
  }

  private isClickInside(target: Element): boolean {
    return Boolean(
      target.closest(EDITOR_SELECTORS.EDITABLE) ||
      target.closest(EDITOR_SELECTORS.TOOLBAR)
    );
  }

  showTextToolbar(position: { top: number; left: number }) {
    this.#state.next({
      show: true,
      isTextSelection: true,
      isImageSelected: false,
      isCodeBlock: false,
      position
    });
  }

  showImageToolbar(position: { top: number; left: number }) {
    this.#state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: true,
      isCodeBlock: false,
      position
    });
  }

  showCodeToolbar(position: { top: number; left: number }) {
    this.#state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: false,
      isCodeBlock: true,
      position
    });
  }

  hideToolbar() {
    this.#state.next(initialToolbarState);
  }
}
