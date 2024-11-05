import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  AfterViewInit,
  OnDestroy, RendererFactory2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarState } from '../models/toolbar.models';
import { SelectionService } from '../services/selection.service';
import { BlockService } from '../services/block.service';
import { ContentRendererService } from '../services/content-renderer.service';
import { Block, BlockEvent } from '../models/block.models';
import { ToolbarStateService } from '../toolbar.service';

@Component({
  selector: 'app-editable-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-container.component.html',
  styleUrls: ['./editable-container.component.scss']
})
export class EditableContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('editableDiv') editableDivRefs!: QueryList<ElementRef>;
  @Output() edit = new EventEmitter<BlockEvent>();
  @Output() toolbarStateChange = new EventEmitter<ToolbarState>();

  blocks: Block[] = [];
  selectedElement: HTMLElement | null = null;
  private pendingFocusIndex: number | null = null;
  private clickOutsideListener!: () => void;
  private renderer!: Renderer2;

  constructor(
    private cdr: ChangeDetectorRef,
    rendererFactory: RendererFactory2,
    private blockService: BlockService,
    private contentRenderer: ContentRendererService,
    private selectionService: SelectionService,
    private toolbarStateService: ToolbarStateService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.blocks = [this.blockService.createBlock()];
    this.initializeClickOutsideListener();
  }

  private initializeClickOutsideListener(): void {
    this.clickOutsideListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!this.isClickInside(event.target as Element)) {
        this.toolbarStateService.hideToolbar();
      }
    });
  }

  ngAfterViewInit() {
    this.editableDivRefs?.changes.subscribe(() => {
      if (this.pendingFocusIndex !== null) {
        this.focusBlock(this.pendingFocusIndex);
        this.pendingFocusIndex = null;
      }
    });
  }

  /* Block Management */
  createBlock(index: number): void {
    const newBlock = this.blockService.createBlock();
    this.blocks.splice(index + 1, 0, newBlock);
    this.pendingFocusIndex = index + 1;
    this.cdr.detectChanges();
  }

  private deleteBlock(index: number): void {
    if (index > 0) {
      this.blocks.splice(index, 1);
      this.pendingFocusIndex = index - 1;
      this.cdr.detectChanges();
    }
  }

  private focusBlock(index: number): void {
    const divs = this.editableDivRefs.toArray();
    if (divs[index]) {
      const div = divs[index].nativeElement;
      div.focus();
      this.selectionService.focusAtEnd(div);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    switch(event.key) {
      case 'Enter':
        if (!event.shiftKey) {
          event.preventDefault();
          this.createBlock(index);
        }
        break;
      case 'Backspace':
        const div = this.editableDivRefs.get(index)?.nativeElement;
        if (div && div.textContent.trim() === '' && this.blocks.length > 1) {
          event.preventDefault();
          this.deleteBlock(index);
        }
        break;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.selectionService.hasTextSelection()) {
      const selectionInfo = this.selectionService.getSelectionInfo();
      if (selectionInfo) {
        this.showTextToolbar(selectionInfo.rect);
      }
    }
  }

  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.tagName === 'IMG') {
      this.handleImageClick(target as HTMLImageElement);
    } else if (target.closest('pre')) {
      this.handleCodeClick(target.closest('pre') as HTMLElement);
    }
  }

  onPaste(event: ClipboardEvent, index: number) {
    event.preventDefault();

    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      if (this.blockService.isCodeContent(text)) {
        this.insertCodeBlock(text, index);
      } else {
        document.execCommand('insertText', false, text);
      }
    } else {
      this.handleImagePaste(event, index);
    }
  }

  private isClickInside(target: Element): boolean {
    return !!target.closest('.editable-div') || !!target.closest('.floating-toolbar');
  }

  private insertCodeBlock(code: string, index: number) {
    const div = this.editableDivRefs.get(index)?.nativeElement;
    if (div) {
      this.contentRenderer.renderCodeBlock(div, code);
      this.edit.emit({
        type: 'code',
        content: code,
        index
      });
    }
  }

  private handleImagePaste(event: ClipboardEvent, index: number) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            this.insertImage(file, index);
          }
        }
      }
    }
  }

  private insertImage(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const div = this.editableDivRefs.get(index)?.nativeElement;
      if (div && e.target?.result) {
        const img = this.renderer.createElement('img');
        this.renderer.setAttribute(img, 'src', e.target.result as string);
        this.renderer.appendChild(div, img);

        this.edit.emit({
          type: 'image',
          content: e.target.result as string,
          index
        });
      }
    };
    reader.readAsDataURL(file);
  }

  private handleImageClick(image: HTMLImageElement) {
    this.updateSelectedElement(image);
    const rect = this.selectionService.getElementRect(image);
    const position = this.selectionService.adjustToolbarPosition(rect);
    this.toolbarStateService.showImageToolbar(position);
  }

  private handleCodeClick(codeBlock: HTMLElement) {
    this.updateSelectedElement(codeBlock);
    const rect = this.selectionService.getElementRect(codeBlock);
    const position = this.selectionService.adjustToolbarPosition(rect);
    this.toolbarStateService.showCodeToolbar(position);
  }

  private updateSelectedElement(element: HTMLElement) {
    if (this.selectedElement) {
      this.renderer.removeClass(this.selectedElement, 'selected');
    }
    this.selectedElement = element;
    this.renderer.addClass(element, 'selected');
  }

  private showTextToolbar(rect: DOMRect) {
    const position = this.selectionService.adjustToolbarPosition(rect);
    this.toolbarStateService.showTextToolbar(position);
  }

  ngOnDestroy() {
    if (this.clickOutsideListener) {
      this.clickOutsideListener();
    }
  }
}
