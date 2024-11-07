import { Injectable, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomHelper } from '../../util/dom/dom-helper';
import { EditorBlocks } from './editor.models';
import { Block } from '../../data-access/block.models';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly fb = inject(FormBuilder);
  private readonly domHelper = inject(DomHelper);

  initializeForm(blocks: Block[], formGroup: FormGroup): void {
    const formArray = formGroup.get('blocks') as FormArray;
    formArray.clear();

    blocks.forEach((block) => {
      formArray.push(this.fb.group({
        content: [block.content]
      }));
    });
  }

  addBlock(blocksArray: FormArray): void {
    blocksArray.push(this.fb.group({ content: [''] }));
    setTimeout(() => {
      this.domHelper.focusBlock(blocksArray.length - 1);
    }, 10);
  }

  removeBlock(index: number, blocksArray: FormArray): void {
    if (blocksArray.length <= 1) {
      const currentBlock = blocksArray.at(0);
      currentBlock.patchValue({ content: '' });
      return;
    }

    blocksArray.removeAt(index);

    if (index > 0) {
      this.domHelper.focusBlock(index - 1);
    }
  }

  mergeWithPreviousBlock(currentIndex: number, blocksArray: FormArray): void {
    if (currentIndex <= 0) {
      return;
    }

    const currentBlock = blocksArray.at(currentIndex);
    const previousBlock = blocksArray.at(currentIndex - 1);
    const currentContent = currentBlock.get('content')?.value || '';
    const previousContent = previousBlock.get('content')?.value || '';
    previousBlock.patchValue({ content: previousContent + currentContent });

    blocksArray.removeAt(currentIndex);
    this.domHelper.focusBlock(currentIndex - 1);
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
