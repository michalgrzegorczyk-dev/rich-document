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

  map : any = {
    'text': (position:Position) => this.#toolbarStateService.showTextToolbar(position),
    'img': (position: Position) => this.#toolbarStateService.showImageToolbar(position),
    'code': (position: Position) =>this.#toolbarStateService.showCodeToolbar(position)
  };

  mapAction: any= {
    'format': (value: string) => this.toolbarAction.emit({ type: 'format', value }),
    'image': (value: string) => {
      console.log('Image options clicked:', value);
      this.toolbarAction.emit({ type: 'image', value });
    },
    'code': (value: string) => console.log('Code options clicked:', value)
  }

  @Input()
  set toolbarActionInput(action: ToolbarActionInput) {
    this.map[action.type](action.position);
  }

  handleAction(type: string, value: string): void {
    this.mapAction[type](value);
  }
}
