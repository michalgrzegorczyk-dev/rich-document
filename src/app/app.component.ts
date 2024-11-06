import { Component } from '@angular/core';
import { RichDocumentComponent } from './feature/rich-document/rich-document.component';

@Component({
  standalone: true,
  imports: [RichDocumentComponent],
  selector: 'app-root',
  template: '<app-rich-document />',
  styles: [`
      :host {
          padding: 50px;
          display: block;
      }
  `]
})
export class AppComponent {
}
