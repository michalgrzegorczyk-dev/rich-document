import { ViewChild, Input, Output, ElementRef, EventEmitter, Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BlockEvent } from '../editor.models';
import { CommonModule } from '@angular/common';
import { ContenteditableValueAccessorDirective } from '../../../util/contenteditable-value-accessor.directive';

@Component({
  selector: 'app-editor-block',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective
  ],
  template: `
    <div [formGroup]="blockForm" class="block-container">
      <div class="hash">#</div>
      <div #editableDiv
           formControlName="content"
           (keydown)="onKeydown($event)"
           contenteditable
           data-placeholder="Type something..."
           class="editable-div"
           [style.white-space]="'pre-wrap'">
      </div>
    </div>
  `,
  styles: [`
    .block-container {
      display: flex;
      align-items: flex-start;
      position: relative;
    }

    .hash {
      position: absolute;
      left: -24px;
      color: #666;
    }

    .editable-div {
      flex: 1;
      min-height: 24px;
      padding: 8px;
      border: 1px solid #ddd;
      outline: none;
      white-space: pre-wrap;
      word-wrap: break-word;

      &[data-placeholder]:empty:before {
        content: attr(data-placeholder);
        color: #999;
        pointer-events: none;
      }
    }
  `]
})
export class BlockComponent {
  @ViewChild('editableDiv') editableDiv!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) blockForm!: FormGroup;
  @Input({ required: true }) index!: number;
  @Output() blockEvent = new EventEmitter<BlockEvent>();

  onKeydown(event: KeyboardEvent): void {
    this.blockEvent.emit({
      type: 'keydown',
      index: this.index,
      event
    });
  }
}
