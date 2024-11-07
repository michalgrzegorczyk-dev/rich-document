import { Component, EventEmitter, Input, Output, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectionTrackerDirective } from '../../../util/selection-tracker.directive';
import { ContenteditableValueAccessorDirective } from '../../../util/contenteditable-value-accessor.directive';
import { EditorService } from '../editor.service';
import { SelectionInfo } from '../../../util/selection.service';
import { BlockEvent } from '../editor.models';

@Component({
  selector: 'app-editor-block',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective,
    SelectionTrackerDirective
  ],
  template: `
    <div [formGroup]="blockForm" class="block-container">
      <div class="hash">#</div>
      <div #editableDiv
           formControlName="content"
           appSelectionTracker
           (selectionChange)="onSelectionChange($event)"
           (keydown)="onKeydown($event)"
           contenteditable
           data-placeholder="Type something..."
           class="editable-div">
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

      &[data-placeholder]:empty:before {
        content: attr(data-placeholder);
        color: #999;
        pointer-events: none;
      }
    }
  `]
})
export class BlockComponent {
  @ViewChild('editableDiv') editableDiv!: ElementRef;
  @Input({ required: true }) blockForm!: FormGroup;
  @Input({ required: true }) index!: number;
  @Output() blockEvent = new EventEmitter<BlockEvent>();

  focus() {
    this.editableDiv.nativeElement.focus();
  }

  onSelectionChange(selectionInfo: SelectionInfo): void {
    this.blockEvent.emit({
      type: 'selection',
      index: this.index,
      event: selectionInfo
    });
  }

  onKeydown(event: KeyboardEvent): void {
    this.blockEvent.emit({
      type: 'keydown',
      index: this.index,
      event
    });
  }
}
