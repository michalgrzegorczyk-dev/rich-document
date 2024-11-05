import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToolbarState } from './models/toolbar.models';

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
  private state = new BehaviorSubject<ToolbarState>(initialToolbarState);
  state$ = this.state.asObservable();

  showTextToolbar(position: { top: number; left: number }) {
    this.state.next({
      show: true,
      isTextSelection: true,
      isImageSelected: false,
      isCodeBlock: false,
      position
    });
  }

  showImageToolbar(position: { top: number; left: number }) {
    this.state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: true,
      isCodeBlock: false,
      position
    });
  }

  showCodeToolbar(position: { top: number; left: number }) {
    this.state.next({
      show: true,
      isTextSelection: false,
      isImageSelected: false,
      isCodeBlock: true,
      position
    });
  }

  hideToolbar() {
    this.state.next(initialToolbarState);
  }

  getCurrentState(): ToolbarState {
    return this.state.getValue();
  }
}
