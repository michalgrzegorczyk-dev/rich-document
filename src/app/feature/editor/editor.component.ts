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

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective,
    BypassHtmlPipe,
    FormsModule,
    ToolbarComponent
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
  set editorBlocks(blocks: Block[]) {//todo should be editor blocks, later
    if (this.firstTime) {
      const formArray = this.formGroup.get('blocks') as FormArray;
      formArray.clear();

      blocks.forEach((block) => {
        formArray.push(this.fb.group({
          content: [block.content]
        }));
      });
      this.firstTime = false;
    }
  }

  readonly toolbarState = signal<ToolbarActionInput>({ type: '', position: { top: 0, left: 0 } });

  fb = inject(FormBuilder);
  readonly #domHelper = inject(DomHelper);
  formGroup = this.fb.group({
    blocks: this.fb.array([])
  });
  firstTime = true;


  get itemsFormArray() {
    return this.formGroup.get('blocks') as FormArray;
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      debounceTime(1_000),
      map(() => {
        return this.formGroup.value as EditorBlocks;
      })
    ).subscribe((value) => {
      console.log('saving');
      console.log(value);
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

  addItem(): void {
    this.itemsFormArray.push(this.fb.group({ content: [''] }));
    setTimeout(() => {
      this.#domHelper.focusBlock(this.itemsFormArray.length - 1);
    }, 10);
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length <= 1) {
      const currentBlock = this.itemsFormArray.at(0);
      currentBlock.patchValue({ content: '' });
      return;
    }

    this.itemsFormArray.removeAt(index);

    if (index > 0) {
      this.#domHelper.focusBlock(index - 1);
    }
  }

  mergeWithPreviousBlock(currentIndex: number): void {
    if (currentIndex <= 0) {
      return;
    }

    const currentBlock = this.itemsFormArray.at(currentIndex);
    const previousBlock = this.itemsFormArray.at(currentIndex - 1);
    const currentContent = currentBlock.get('content')?.value || '';
    const previousContent = previousBlock.get('content')?.value || '';
    previousBlock.patchValue({ content: previousContent + currentContent });

    this.itemsFormArray.removeAt(currentIndex);
    this.#domHelper.focusBlock(currentIndex - 1);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addItem();
      return;
    }

    if (event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      const selection = window.getSelection();
      const isAtStart = selection?.anchorOffset === 0;
      const isEmpty = this.isBlockEmpty(target);

      if (isEmpty && this.itemsFormArray.length > 1) {
        event.preventDefault();
        this.removeItem(index);
        return;
      }

      if (isAtStart && !isEmpty && index > 0) {
        event.preventDefault();
        this.mergeWithPreviousBlock(index);
        return;
      }
    }
  }

  onMouseUp(event: MouseEvent): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();

    if (selectedText) {
      const rect = this.#domHelper.getElementBounds(event.target as HTMLElement);
      const position = this.#domHelper.adjustToolbarPosition(rect);
      this.toolbarState.set({ type: 'text', position });
    }
  }

  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName.toLowerCase() === 'img') {
      const rect = this.#domHelper.getElementBounds(event.target as HTMLElement);
      const position = this.#domHelper.adjustToolbarPosition(rect);
      this.toolbarState.set({ type: 'img', position });
      console.log('Image clicked');
      return;
    }

    const codeBlock = target.closest('pre code') || target.closest('pre');
    if (codeBlock) {
      console.log('Code block clicked');
      return;
    }

    const isInCode = target.closest('code');
    if (isInCode) {
      console.log('Code clicked');
      return;
    }
  }

  private isBlockEmpty(element: HTMLElement): boolean {
    const content = element.innerHTML.trim();
    return (
      content === '' ||
      content === '<br>' ||
      content === '&nbsp;' ||
      element.textContent?.trim() === ''
    );
  }

}
