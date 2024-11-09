import { Component, EventEmitter, Output } from '@angular/core';
import { BaseToolbarDirective } from '../base-toolbar.directive';

@Component({
  selector: 'app-text-toolbar',
  standalone: true,
  template: `
    <div class="toolbar">
      <button (click)="onBold()">
        <strong>B</strong>
      </button>
      <button (click)="onItalic()">
        <em>I</em>
      </button>
    </div>
  `,
  styleUrls: ['./text-toolbar.component.scss'],
})
export class TextToolbarComponent extends BaseToolbarDirective {

  onBold() {
    this.action.emit('bold');
  }

  onItalic() {
    this.action.emit('italic');
  }
}
