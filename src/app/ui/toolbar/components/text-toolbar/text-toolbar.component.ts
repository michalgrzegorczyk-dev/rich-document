import { Component, EventEmitter, Output } from '@angular/core';
import { BaseToolbarDirective } from '../base-toolbar.directive';

@Component({
  selector: 'app-text-toolbar',
  standalone: true,
  template: `
    <div class="toolbar">
      <button (click)="onH1()">
        <strong>H1</strong>
      </button>
      <button (click)="onH2()">
        <strong>H2</strong>
      </button>
      <button (click)="onH3()">
        <strong>H3</strong>
      </button>
      <button (click)="onP()">
        <strong>P</strong>
      </button>

      <button (click)="onBold()">
        <strong>Bold</strong>
      </button>
      <button (click)="onItalic()">
        <em>Italic</em>
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

  onH1() {
    this.action.emit('h1');
  }

  onH2() {
    this.action.emit('h2');
  }

  onH3() {
    this.action.emit('h3');
  }

  onP() {
    this.action.emit('p');
  }
}
