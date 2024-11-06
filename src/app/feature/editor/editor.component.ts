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
import { BlockEvent } from '../../data-access/block.models';
import { BlockStore } from '../../data-access/block.store';
import { filter } from 'rxjs';
import { DomHelper } from '../../util/dom/dom-helper';

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
  @ViewChildren('editableDiv')
  editableDivRefs!: QueryList<ElementRef>;

  @Output()
  edit = new EventEmitter<BlockEvent>();

  @Output()
  editorAction = new EventEmitter<{ type: string; blockId: string; data?: any; }>();

  readonly blockStore = inject(BlockStore);
  readonly #domHelper = inject(DomHelper);

  readonly blocks = this.blockStore.blocks;

  ngOnInit(): void {
    this.blockStore.createBlock();
    this.#domHelper.setEditableDivRefs(this.editableDivRefs);
  }

  ngAfterViewInit(): void {
    this.#domHelper.setEditableDivRefs(this.editableDivRefs);

    this.editableDivRefs.changes
      .pipe(
        filter(() => this.#domHelper.hasPendingFocus())
      )
      .subscribe(() => {
        this.#domHelper.setEditableDivRefs(this.editableDivRefs);
        const index = this.#domHelper.getPendingIndex();
        if (index !== null) {
          this.#domHelper.focusBlock(index);
        }
      });
  }

  createBlock(): void {
    this.editorAction.emit({ type: 'create', blockId: '', data: null });
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    this.editorAction.emit({ type: 'keydown', blockId: '', data: { event, index } });
  }

  onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const editableDiv = targetElement.closest('.editable-div') as HTMLDivElement | null;

    if(editableDiv) {
      console.log('Editable Div ID:', editableDiv['id']);
      this.editorAction.emit({ type: 'click', blockId: editableDiv['id'], data: event.target});
    }
  }
}
