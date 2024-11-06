import { Component } from '@angular/core';
import { RichDocumentComponent } from './components/rich-document/rich-document.component';

@Component({
  standalone: true,
  imports: [RichDocumentComponent],
  selector: 'app-root',
  template: `
    <h1>Rich Document Demo</h1>
    <app-rich-document />
  `,
})
export class AppComponent {
}
