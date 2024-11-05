import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { ToolbarState } from '../models/toolbar.models';
import { ToolbarStateService } from '../toolbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [NgIf, AsyncPipe],
  standalone: true
})
export class ToolbarComponent {
  @Input() state!: ToolbarState | null;
  @Output() action = new EventEmitter<{type: string, value: string}>();

  constructor(private toolbarStateService: ToolbarStateService) {}

  handleAction(type: string, value: string) {
    this.action.emit({type, value});
  }
}
