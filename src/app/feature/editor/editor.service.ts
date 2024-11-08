import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private fb: FormBuilder) {}

  initializeForm(blocks: any[], formGroup: FormGroup): void {
    const blocksArray = formGroup.get('blocks') as FormArray;
    blocks.forEach(block => {
      blocksArray.push(this.fb.group({
        content: [block.content]
      }));
    });
  }

  mapToEditorBlocks(value: any): any {
    return {
      blocks: value.blocks.map((block: any) => ({
        content: block.content
      }))
    };
  }

  splitBlock(element: HTMLElement, index: number, blocksArray: FormArray): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer)) return;

    // Store the current block's HTML
    const fullContent = element.innerHTML;

    // Create a temporary div to work with the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullContent;

    // Create a range that represents everything up to the cursor
    const beforeRange = document.createRange();
    beforeRange.setStart(element, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    // Create a temp element to extract HTML before cursor
    const beforeTemp = document.createElement('div');
    beforeTemp.appendChild(beforeRange.cloneContents());
    const beforeCursor = beforeTemp.innerHTML;

    // Get the HTML after the cursor
    const afterTemp = document.createElement('div');
    const afterRange = document.createRange();
    afterRange.setStart(range.startContainer, range.startOffset);
    afterRange.setEnd(element, element.childNodes.length);
    afterTemp.appendChild(afterRange.cloneContents());
    const afterCursor = afterTemp.innerHTML;

    // Update current block with content before cursor
    const currentBlock = blocksArray.at(index) as FormGroup;
    currentBlock.patchValue({ content: beforeCursor });

    // Create and insert new block with content after cursor
    const newBlock = this.fb.group({
      content: [afterCursor]
    });
    blocksArray.insert(index + 1, newBlock);
  }
}
