import { BlockService } from './block.service';
import { ContentRendererService } from './content-renderer.service';
import { QueryList, ElementRef, EventEmitter } from '@angular/core';
import { BlockEvent } from '../models/block.models';

export class PasteManager {
  constructor(
    private blockService: BlockService,
    private contentRenderer: ContentRendererService,
    private editableDivRefs: QueryList<ElementRef>,
    private document: Document,
    private edit: EventEmitter<BlockEvent>
  ) {}

  handlePaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();

    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      this.handleTextPaste(text, index);
    } else {
      this.handleImagePaste(event, index);
    }
  }

  private handleTextPaste(text: string, index: number): void {
    if (this.blockService.isCodeContent(text)) {
      this.insertCodeBlock(text, index);
    } else {
      document.execCommand('insertText', false, text);
    }
  }

  private handleImagePaste(event: ClipboardEvent, index: number): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          this.insertImage(file, index);
        }
      }
    }
  }

  private insertCodeBlock(code: string, index: number): void {
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

  private insertImage(file: File, index: number): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const div = this.editableDivRefs.get(index)?.nativeElement;
      if (div && e.target?.result) {
        const img = this.document.createElement('img');
        img.src = e.target.result as string;
        div.appendChild(img);

        this.edit.emit({
          type: 'image',
          content: e.target.result as string,
          index
        });
      }
    };
    reader.readAsDataURL(file);
  }
}
