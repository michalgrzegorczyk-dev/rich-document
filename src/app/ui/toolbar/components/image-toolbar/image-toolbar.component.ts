import { Component, EventEmitter, Output } from '@angular/core';
import { BaseToolbarDirective } from '../base-toolbar.directive';

@Component({
  selector: 'app-image-toolbar',
  standalone: true,
  template: `
    <div class="toolbar">
      <button (click)="onResize25()">
        <strong>25%</strong>
      </button>
      <button (click)="onResize50()">
        <em>50%</em>
      </button>
    </div>
  `,
  styleUrls: ['./image-toolbar.component.scss'],
})
export class ImageToolbarComponent extends BaseToolbarDirective {

  onResize25() {
    this.action.emit('resize25');
  }

  onResize50() {
    this.action.emit('resize25');
  }
}
