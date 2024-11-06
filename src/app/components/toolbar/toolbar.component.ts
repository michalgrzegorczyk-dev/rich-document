import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { ToolbarStateService } from '../../services/toolbar.service';
import { ToolbarState } from '../../models/toolbar.models';

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
