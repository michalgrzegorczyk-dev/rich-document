import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'bypassHtml',
  standalone: true
})
export class BypassHtmlPipe implements PipeTransform {

  readonly #domSanitizer = inject(DomSanitizer);

  transform(value: string | null): SafeHtml {
    if (!value) {
      return '';
    }

    return this.#domSanitizer.bypassSecurityTrustHtml(value);
  }
}
