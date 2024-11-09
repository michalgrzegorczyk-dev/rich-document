import { Directive, Output, EventEmitter } from '@angular/core';

@Directive({
  standalone: true,
})
export class BaseToolbarDirective {
  @Output() action = new EventEmitter<string>();
}
