import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { NgIf, AsyncPipe, NgStyle } from '@angular/common';
import { ToolbarStateService } from './toolbar.service';
import { ToolbarActionInput, ToolbarActionOutput, Position } from './toolbar.models';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [NgIf, AsyncPipe, NgStyle],
  standalone: true
})
export class ToolbarComponent {
  @Output()
  toolbarAction = new EventEmitter<ToolbarActionOutput>();

  readonly #toolbarStateService = inject(ToolbarStateService);
  readonly toolbarState$ = this.#toolbarStateService.state$;

  // make map to function for actions
  map : any = {
    'text': (position:Position) => this.#toolbarStateService.showTextToolbar(position),
    'img': (position: Position) => this.#toolbarStateService.showImageToolbar(position),
    'code': (position: Position) =>this.#toolbarStateService.showCodeToolbar(position)
  };

  @Input()
  set toolbarType(action: ToolbarActionInput) {
    this.map[action.type](action.position);
  }

  handleAction(type: string, value: string): void {
    console.log(`Toolbar action: ${type} - ${value}`);

    switch (type) {
      case 'format':
        this.toolbarAction.emit({ type: 'format', value });
        break;
      case 'image':
        console.log('Image options clicked:', value);
        break;
      case 'code':
        console.log('Code options clicked:', value);
        break;
    }
  }

}
