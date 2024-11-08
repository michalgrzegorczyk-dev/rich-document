import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnInit,
  inject,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, debounceTime, map, BehaviorSubject, withLatestFrom } from 'rxjs';
import { DomHelper } from '../../util/dom/dom-helper';
import { EditorBlocks, BlockEvent } from './editor.models';
import { Block } from '../../data-access/block.models';
import { ReactiveFormsModule, FormBuilder, FormArray, FormsModule, FormGroup } from '@angular/forms';
import { ContenteditableValueAccessorDirective } from '../../util/contenteditable-value-accessor.directive';
import { BypassHtmlPipe } from '../../util/bypass-html.pipe';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { ToolbarActionInput } from '../../ui/toolbar/toolbar.models';
import { EditorService } from './editor.service';
import { BlockComponent } from './editor-block/editor-block.component';

interface FocusInstruction {
  index: number;
  cursorPosition?: number;
}

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
    BlockComponent,
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

  readonly #focusInstruction = new BehaviorSubject<FocusInstruction | null>(null);
  readonly focusInstruction$ = this.#focusInstruction.asObservable();

  readonly #editorService = inject(EditorService);
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
      withLatestFrom(this.focusInstruction$),
      filter(([_, instruction]) => instruction !== null)
    ).subscribe(([_, instruction]) => {
      if (instruction) {
        this.focusBlock(instruction.index, instruction.cursorPosition);
        this.#focusInstruction.next(null);
      }
    });
  }

  onBlockEvent(event: BlockEvent): void {
    switch (event.type) {
      case 'keydown':
        this.handleKeydown(event.event, event.index);
        break;
    }
  }

  private handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const target = event.target as HTMLElement;
      this.#editorService.splitBlock(target, index, this.blocksFromArray);
      this.#focusInstruction.next({ index: index + 1 });
      return;
    }

    if (event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      const selection = window.getSelection();

      if (!selection?.rangeCount) return;
      const range = selection.getRangeAt(0);

      // Handle empty block case
      const isEmpty = target.textContent?.trim() === '' && !target.querySelector('img');
      if (isEmpty && index > 0) {
        event.preventDefault();
        this.removeEmptyBlock(index);
        return;
      }

      // Handle merge case
      const isAtStart = this.#editorService.isCursorAtStart(target, range);
      if (isAtStart && index > 0) {
        event.preventDefault();
        this.mergeWithPreviousBlock(index);
        return;
      }
    }
  }

  private removeEmptyBlock(index: number): void {
    const previousIndex = index - 1;
    if (previousIndex >= 0) {
      const previousBlock = this.blocksFromArray.at(previousIndex) as FormGroup;
      const previousContent = previousBlock.get('content')?.value || '';

      // Create a temp element to get content length
      const tempElement = document.createElement('div');
      tempElement.innerHTML = previousContent;
      const cursorPosition = tempElement.innerHTML.length;

      this.blocksFromArray.removeAt(index);

      // Focus previous block with cursor at the end
      this.#focusInstruction.next({
        index: previousIndex,
        cursorPosition
      });
    }
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


// In editor.component.ts
  private focusBlock(index: number, cursorPosition?: number): void {
    const blockComponent = this.blockRefs.get(index);
    if (!blockComponent) return;

    const element = blockComponent.editableDiv.nativeElement;
    element.focus();

    if (typeof cursorPosition === 'number') {
      const selection = window.getSelection();
      const range = document.createRange();

      if (cursorPosition >= element.innerHTML.length) {
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }

      let currentPos = 0;
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
      );

      let currentNode: Node | null = walker.nextNode();
      let found = false;

      while (currentNode && !found) {
        // Handle IMG elements
        if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as Element).tagName === 'IMG') {
          if (currentPos === cursorPosition) {
            const parentElement = currentNode.parentElement;
            if (parentElement) {
              // Convert NodeList to Array and use type assertion
              const children = Array.from(parentElement.childNodes) as Node[];
              const nodeIndex = children.findIndex(node => node === currentNode);
              if (nodeIndex !== -1) {
                range.setStart(parentElement, nodeIndex);
                range.setEnd(parentElement, nodeIndex);
                found = true;
              }
            }
            break;
          }
          currentPos += (currentNode as Element).outerHTML.length;
        }
        // Handle text nodes
        else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent) {
          const length = currentNode.textContent.length;
          if (currentPos + length >= cursorPosition) {
            range.setStart(currentNode, cursorPosition - currentPos);
            range.setEnd(currentNode, cursorPosition - currentPos);
            found = true;
            break;
          }
          currentPos += length;
        }
        currentNode = walker.nextNode();
      }

      // Default to end if position not found
      if (!found) {
        range.selectNodeContents(element);
        range.collapse(false);
      }

      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }




  mergeWithPreviousBlock(currentIndex: number): void {
    const currentBlock = this.blocksFromArray.at(currentIndex) as FormGroup;
    const previousBlock = this.blocksFromArray.at(currentIndex - 1) as FormGroup;

    const currentContent = currentBlock.get('content')?.value || '';
    const previousContent = previousBlock.get('content')?.value || '';

    // Set cursor position to end of previous content
    const cursorPosition = previousContent.length;

    // Merge contents
    previousBlock.patchValue({ content: previousContent + currentContent });
    this.blocksFromArray.removeAt(currentIndex);

    // Focus with cursor at merge point
    this.#focusInstruction.next({
      index: currentIndex - 1,
      cursorPosition
    });
  }



  removeBlock(index: number): void {
    const previousIndex = index - 1;
    if (previousIndex >= 0) {
      // Get the content length of the previous block to position cursor at the end
      const previousBlock = this.blocksFromArray.at(previousIndex) as FormGroup;
      const previousContent = previousBlock.get('content')?.value || '';
      const cursorPosition = previousContent.length;

      // Remove current block and focus previous with cursor at end
      this.blocksFromArray.removeAt(index);
      this.#focusInstruction.next({
        index: previousIndex,
        cursorPosition
      });
    }
  }
  addBlock(index: number): void {
    const newBlock = this.fb.group({
      content: ['']
    });
    this.blocksFromArray.insert(index, newBlock);
    this.#focusInstruction.next({ index });
  }
}
