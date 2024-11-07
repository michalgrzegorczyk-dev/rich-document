import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnInit,
  inject,
  Input,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, debounceTime, map } from 'rxjs';
import { DomHelper } from '../../util/dom/dom-helper';
import { EditorBlocks } from './editor.models';
import { Block } from '../../data-access/block.models';
import { ReactiveFormsModule, FormBuilder, FormArray, FormsModule } from '@angular/forms';
import { ContenteditableValueAccessorDirective } from '../../util/contenteditable-value-accessor.directive';
import { BypassHtmlPipe } from '../../util/bypass-html.pipe';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { ToolbarActionInput } from '../../ui/toolbar/toolbar.models';
import { EditorService } from './editor.service';
import { SelectionTrackerDirective } from '../../util/selection-tracker.directive';
import { SelectionInfo } from '../../util/selection.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective,
    BypassHtmlPipe,
    FormsModule,
    ToolbarComponent,
    SelectionTrackerDirective
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {
  @ViewChildren('editableDiv')
  editableDivRefs!: QueryList<ElementRef>;

  @Output()
  editorBlocksChange = new EventEmitter<EditorBlocks>();

  @Input()
  set editorBlocks(blocks: Block[]) {
    if (this.firstTime) {
      this.#editorService.initializeForm(blocks, this.formGroup);
      this.firstTime = false;
    }
  }

  readonly toolbarAction = signal<ToolbarActionInput>({ type: '', position: { top: 0, left: 0 } });

  readonly #editorService = inject(EditorService);
  readonly #domHelper = inject(DomHelper);
  readonly fb = inject(FormBuilder);

  formGroup = this.fb.group({
    blocks: this.fb.array([])
  });
  firstTime = true;

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      debounceTime(1_000),
      map(() => this.#editorService.mapToEditorBlocks(this.formGroup.value))
    ).subscribe((value) => {
      this.editorBlocksChange.emit(value);
    });
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

  get blocksFromArray() {
    return this.formGroup.get('blocks') as FormArray;
  }

  onSelectionChange(selectionInfo: SelectionInfo): void {
    this.toolbarAction.set({
      type: selectionInfo.type,
      position: selectionInfo.position
    });
  }

  onToolbarAction(event: { type: string, value: string }) {
    console.log(`Toolbar action: ${event.type} - ${event.value}`);
    switch (event.type) {
      case 'format':
        document.execCommand(event.value, false);
        break;
      case 'image':
        console.log('Image things.');
        break;
      case 'code':
        console.log('Code things.');
        break;
    }
  }

  addBlock(): void {
    this.#editorService.addBlock(this.blocksFromArray);
  }

  removeBlock(index: number): void {
    this.#editorService.removeBlock(index, this.blocksFromArray);
  }

  mergeWithPreviousBlock(currentIndex: number): void {
    this.#editorService.mergeWithPreviousBlock(currentIndex, this.blocksFromArray);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addBlock();
      return;
    }

    if (event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      const selection = window.getSelection();
      const isAtStart = selection?.anchorOffset === 0;
      const isEmpty = this.#editorService.isBlockEmpty(target);

      if (isEmpty && this.blocksFromArray.length > 1) {
        event.preventDefault();
        this.removeBlock(index);
        return;
      }

      if (isAtStart && !isEmpty && index > 0) {
        event.preventDefault();
        this.mergeWithPreviousBlock(index);
        return;
      }
    }
  }
}
