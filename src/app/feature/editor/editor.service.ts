import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private fb: FormBuilder) {}

  splitBlock(element: HTMLElement, index: number, blocksArray: FormArray): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer)) return;

    // Get the current content
    const beforeRange = document.createRange();
    const afterRange = document.createRange();

    // Set ranges correctly
    beforeRange.setStartBefore(element.firstChild || element);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    afterRange.setStart(range.startContainer, range.startOffset);
    afterRange.setEndAfter(element.lastChild || element);

    // Create temporary containers
    const beforeContainer = document.createElement('div');
    const afterContainer = document.createElement('div');

    beforeContainer.appendChild(beforeRange.cloneContents());
    afterContainer.appendChild(afterRange.cloneContents());

    // Update blocks
    const currentBlock = blocksArray.at(index) as FormGroup;
    const newBlock = this.fb.group({
      content: [afterContainer.innerHTML]
    });

    currentBlock.patchValue({ content: beforeContainer.innerHTML });
    blocksArray.insert(index + 1, newBlock);
  }

  mapToEditorBlocks(value: any): any {
    return {
      blocks: value.blocks.map((block: any) => ({
        content: block.content
      }))
    };
  }

  isCursorAtStart(element: HTMLElement, range: Range): boolean {
    // Check if there's any non-whitespace content before the cursor
    const beforeRange = document.createRange();
    beforeRange.setStart(element, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    // Create temp div to check content before cursor
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(beforeRange.cloneContents());

    // If there's no content or only whitespace before cursor
    return !tempDiv.textContent?.trim() && !tempDiv.querySelector('img');
  }

  initializeForm(blocks: any[], formGroup: FormGroup): void {
    const blocksArray = formGroup.get('blocks') as FormArray;
    blocks.forEach(block => {
      blocksArray.push(this.fb.group({
        content: [block.content]
      }));
    });
  }
}
