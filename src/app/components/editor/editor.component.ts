import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockEvent } from '../../models/block.models';
import { BlockStore } from '../../services/block.store';
import { filter } from 'rxjs';
import { FocusManager } from '../../services/focus-manager';

export const EDITOR_SELECTORS = {
  EDITABLE: '.editable-div',
  TOOLBAR: '.floating-toolbar'
} as const;

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {
  @ViewChildren('editableDiv') editableDivRefs!: QueryList<ElementRef>;

  @Output() edit = new EventEmitter<BlockEvent>();
  @Output() blockAction = new EventEmitter<{ type: string; blockId: string; data?: any; }>();

  readonly blockStore = inject(BlockStore);
  readonly focusManager = inject(FocusManager);

  blocks = this.blockStore.blocks;

  ngOnInit(): void {
    this.blockStore.createBlock();

    this.focusManager.setEditableDivRefs(this.editableDivRefs);}

  ngAfterViewInit(): void {
    this.editableDivRefs.changes
      .pipe(
        filter(() => this.focusManager.hasPendingFocus())
      )
      .subscribe(() => {
        this.focusManager.setEditableDivRefs(this.editableDivRefs);
        const index = this.focusManager.getPendingIndex();
        if (index !== null) {
          this.focusManager.focusBlock(index);
        }
      });
  }

  createBlock(): void {
    this.blockAction.emit({ type: 'create', blockId: '', data: null });
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    this.blockAction.emit({ type: 'keydown', blockId: '', data: { event, index } });
  }

  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const editableDiv = targetElement.closest('.editable-div') as HTMLDivElement | null;

    if(editableDiv) {
      console.log('Editable Div ID:', editableDiv['id']);
      this.blockAction.emit({ type: 'click', blockId: editableDiv['id'], data: event.target});
    }
  }
}
