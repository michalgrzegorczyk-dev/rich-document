import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'bypassHtml', standalone: true})
export class BypassHtmlPipe implements PipeTransform  {
  constructor(@Inject(DomSanitizer) private readonly sanitized: DomSanitizer) {}

  transform(value: string | null): SafeHtml {
    if (!value) {
      return '';
    }
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
