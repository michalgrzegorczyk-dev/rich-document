import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly author = input.required<string>();
}
