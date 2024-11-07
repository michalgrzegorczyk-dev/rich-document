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
import { EditorBlocks, BlockEvent } from './editor.models';
import { Block } from '../../data-access/block.models';
import { ReactiveFormsModule, FormBuilder, FormArray, FormsModule } from '@angular/forms';
import { ContenteditableValueAccessorDirective } from '../../util/contenteditable-value-accessor.directive';
import { BypassHtmlPipe } from '../../util/bypass-html.pipe';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { ToolbarActionInput } from '../../ui/toolbar/toolbar.models';
import { EditorService } from './editor.service';
import { SelectionTrackerDirective } from '../../util/selection-tracker.directive';
import { SelectionInfo } from '../../util/selection.service';
import { BlockComponent } from './editor-block/editor-block.component';

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
    SelectionTrackerDirective,
    BlockComponent
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {
  @ViewChildren(BlockComponent)
  blockRefs!: QueryList<BlockComponent>;

  @Output()
  editorBlocksChange = new EventEmitter<EditorBlocks>();

  @Input()
  set editorBlocks(blocks: Block[]) {
    if (this.firstTime) {
      this.#editorService.initializeForm(blocks, this.formGroup);
      this.firstTime = false;
    }
  }

  readonly toolbarAction = signal<ToolbarActionInput>({
    type: '',
    position: { top: 0, left: 0 }
  });

  readonly #editorService = inject(EditorService);
  readonly #domHelper = inject(DomHelper);
  readonly fb = inject(FormBuilder);

  formGroup = this.fb.group({
    blocks: this.fb.array([])
  });

  firstTime = true;

  get blocksFromArray() {
    return this.formGroup.get('blocks') as FormArray;
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      debounceTime(1_000),
      map(() => this.#editorService.mapToEditorBlocks(this.formGroup.value))
    ).subscribe(value => {
      this.editorBlocksChange.emit(value);
    });
  }

  ngAfterViewInit(): void {
    this.blockRefs.changes.pipe(
      filter(() => this.#domHelper.hasPendingFocus())
    ).subscribe(() => {
      const index = this.#domHelper.getPendingIndex();
      if (index !== null) {
        this.focusBlock(index);
      }
    });
  }

  private focusBlock(index: number): void {
    const blockComponent = this.blockRefs.get(index);
    if (blockComponent) {
      blockComponent.focus();
    }
  }




  onBlockEvent(event: BlockEvent): void {
    switch (event.type) {
      case 'keydown':
        this.handleKeydown(event.event, event.index);
        break;
      case 'selection':
        this.handleSelection(event.event);
        break;
    }
  }

  private handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();

      const target = event.target as HTMLElement;
      const selection = window.getSelection();

      if (selection && target) {
        // Get text content instead of innerHTML to avoid HTML tags interfering with position
        const content = target.textContent || '';
        const cursorPosition = selection.anchorOffset;

        // Handle cursor position correctly
        if (cursorPosition >= 0 && cursorPosition <= content.length) {
          const newIndex = this.#editorService.splitBlock(index, this.blocksFromArray, cursorPosition);
          setTimeout(() => {
            this.focusBlock(newIndex);
          }, 10);
        } else {
          // Fallback for when cursor position is invalid
          this.addBlock();
        }
      } else {
        // Fallback for when selection info isn't available
        this.addBlock();
      }
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

  private handleSelection(selectionInfo: SelectionInfo): void {
    this.toolbarAction.set({
      type: selectionInfo.type,
      position: selectionInfo.position
    });
  }

  onToolbarAction(event: { type: string, value: string }): void {
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
    const newIndex = this.#editorService.addBlock(this.blocksFromArray);
    setTimeout(() => {
      this.focusBlock(newIndex);
    }, 10);
  }

  removeBlock(index: number): void {
    const focusIndex = this.#editorService.removeBlock(index, this.blocksFromArray);
    if (focusIndex !== null) {
      setTimeout(() => {
        this.focusBlock(focusIndex);
      }, 10);
    }
  }

  mergeWithPreviousBlock(currentIndex: number): void {
    const focusIndex = this.#editorService.mergeWithPreviousBlock(currentIndex, this.blocksFromArray);
    if (focusIndex !== null) {
      setTimeout(() => {
        this.focusBlock(focusIndex);
      }, 10);
    }
  }
}
