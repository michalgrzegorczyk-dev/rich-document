import { Injectable, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EditorBlocks } from './editor.models';
import { Block } from '../../data-access/block.models';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly fb = inject(FormBuilder);

  initializeForm(blocks: Block[], formGroup: FormGroup): void {
    const formArray = formGroup.get('blocks') as FormArray;
    formArray.clear();

    blocks.forEach((block) => {
      formArray.push(this.fb.group({
        content: [block.content]
      }));
    });
  }

  addBlock(blocksArray: FormArray, index: number = blocksArray.length, content: string = ''): number {
    blocksArray.insert(index, this.fb.group({ content: [content] }));
    return index;
  }

  splitBlock(index: number, blocksArray: FormArray, cursorPosition: number): number {
    const currentBlock = blocksArray.at(index);
    const content = currentBlock.get('content')?.value || '';

    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);

    currentBlock.patchValue({ content: beforeCursor });
    this.addBlock(blocksArray, index + 1, afterCursor);

    return index + 1;
  }

  removeBlock(index: number, blocksArray: FormArray): number | null {
    if (blocksArray.length <= 1) {
      const currentBlock = blocksArray.at(0);
      currentBlock.patchValue({ content: '' });
      return null;
    }

    blocksArray.removeAt(index);
    return index > 0 ? index - 1 : null;
  }

  mergeWithPreviousBlock(currentIndex: number, blocksArray: FormArray): number | null {
    if (currentIndex <= 0) {
      return null;
    }

    const currentBlock = blocksArray.at(currentIndex);
    const previousBlock = blocksArray.at(currentIndex - 1);
    const currentContent = currentBlock.get('content')?.value || '';
    const previousContent = previousBlock.get('content')?.value || '';
    previousBlock.patchValue({ content: previousContent + currentContent });

    blocksArray.removeAt(currentIndex);
    return currentIndex - 1;
  }

  isBlockEmpty(element: HTMLElement): boolean {
    const content = element.innerHTML.trim();
    return (
      content === '' ||
      content === '<br>' ||
      content === '&nbsp;' ||
      element.textContent?.trim() === ''
    );
  }

  mapToEditorBlocks(value: any): EditorBlocks {
    return value as EditorBlocks;
  }
}
