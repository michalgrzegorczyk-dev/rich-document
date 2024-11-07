import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { NgIf, AsyncPipe, NgStyle } from '@angular/common';
import { ToolbarStateService } from './toolbar.service';
import { ToolbarActionInput, ToolbarActionOutput, Position } from './toolbar.models';

type ActionType = 'format' | 'image' | 'code';
type ToolbarType = 'text' | 'img' | 'code' | '';

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

  private readonly toolbarMap: Record<ToolbarType, (position: Position) => void> = {
    'text': (position: Position) => this.#toolbarStateService.showTextToolbar(position),
    'img': (position: Position) => this.#toolbarStateService.showImageToolbar(position),
    'code': (position: Position) => this.#toolbarStateService.showCodeToolbar(position),
    '': () => {} // Default case for empty type
  };

  private readonly actionMap: Record<ActionType, (value: string) => void> = {
    'format': (value: string) => this.toolbarAction.emit({ type: 'format', value }),
    'image': (value: string) => {
      console.log('Image options clicked:', value);
      this.toolbarAction.emit({ type: 'image', value });
    },
    'code': (value: string) => console.log('Code options clicked:', value)
  };

  @Input()
  set toolbarActionInput(action: ToolbarActionInput) {
    if (!action?.type) return;

    const handler = this.toolbarMap[action.type as ToolbarType];
    if (handler) {
      handler(action.position);
    } else {
      console.warn(`Unknown toolbar action type: ${action.type}`);
    }
  }

  handleAction(type: string, value: string): void {
    const handler = this.actionMap[type as ActionType];
    if (handler) {
      handler(value);
    } else {
      console.warn(`Unknown action type: ${type}`);
    }
  }
}
