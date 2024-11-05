// toolbar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';

export interface ToolbarState {
  show: boolean;
  isTextSelection: boolean;
  isImageSelected: boolean;
  isCodeBlock: boolean;
  position: { top: number; left: number };
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [
    NgIf
  ],
  standalone: true
})
export class ToolbarComponent {
  @Input() state!: ToolbarState;
  @Output() action = new EventEmitter<{type: string, value: string}>();

  handleAction(type: string, value: string) {
    this.action.emit({type, value});
  }
}
