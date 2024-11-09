import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Injectable, inject, signal } from '@angular/core';
import { generateRandomStringId } from '../../util/id-generator';
import { BehaviorSubject } from 'rxjs';
import { FocusInstruction } from './models/editor.models';

@Injectable({ providedIn: 'root' })
export class EditorService {
  readonly #fb = inject(FormBuilder);

  private formGroup = this.#fb.group({
    blocks: this.#fb.array([])
  });

  currentBlockId = signal({ blockId: '' });
  currentImageId = signal({ imageId: '' });


  readonly focusInstruction = new BehaviorSubject<FocusInstruction | null>(null);
  readonly focusInstruction$ = this.focusInstruction.asObservable();


  getFormGroup() {
    return this.formGroup;
  }

  getBlocksArray() {
    return this.formGroup.get('blocks') as FormArray;
  }

  setCurrentBlockId(blockId: string) {
    console.log('blockId', blockId);
    this.currentBlockId.set({ blockId });
  }

  setCurrentImageId(imageId: string) {
    this.currentImageId.set({ imageId });
  }

  initializeForm(blocks: any[]): void {
    const blocksArray = this.getBlocksArray();
    blocks.forEach(block =>
      blocksArray.push(this.#fb.group({
        content: [block.content],
        blockId: [block.id]
      }))
    );
  }

  removeEmptyBlock(index: number): void {
    const previousIndex = index - 1;
    if (previousIndex >= 0) {
      const previousBlock = this.getBlocksArray().at(previousIndex);
      const cursorPosition = (previousBlock.get('content')?.value || '').length;

      this.getBlocksArray().removeAt(index);

      const blockId = previousBlock.get('blockId')?.value;
      if (blockId) {
        this.setCurrentBlockId(blockId);
      }

      this.focusInstruction.next({
        index: previousIndex,
        cursorPosition
      });
    }
  }


  cleanHtml(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('.editable-div').forEach(nested => {
      while (nested.firstChild) nested.parentNode?.insertBefore(nested.firstChild, nested);
      nested.remove();
    });

    const cleanEmptyDivs = (el: Element) => {
      if (el.tagName === 'DIV' && !el.classList.contains('editable-div') &&
        !el.textContent?.trim() && !el.querySelector('img')) {
        el.remove();
      } else {
        el.childNodes.forEach(node =>
          node.nodeType === Node.ELEMENT_NODE && cleanEmptyDivs(node as Element)
        );
      }
    };

    Array.from(temp.children).forEach(cleanEmptyDivs);
    return temp.innerHTML;
  }

  mapToEditorBlocks(value: any): any {
    return {
      blocks: value.blocks.map((block: any) => ({
        content: this.cleanHtml(block.content),
        id: block.blockId || block.id
      }))
    };
  }

  splitBlock(element: HTMLElement, index: number): void {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !element.contains(selection.getRangeAt(0).startContainer)) return;

    const [beforeHtml, afterHtml] = this.splitContent(element, selection.getRangeAt(0));
    const currentBlock = this.getBlocksArray().at(index) as FormGroup;

    currentBlock.patchValue({ content: beforeHtml });
    const newBlockId = generateRandomStringId();
    this.getBlocksArray().insert(index + 1, this.#fb.group({ content: [afterHtml], blockId: [newBlockId] }));
    this.setCurrentBlockId(newBlockId);
    this.focusInstruction.next({ index: index + 1 });
  }

  private splitContent(element: HTMLElement, range: Range): [string, string] {
    const beforeRange = document.createRange();
    const afterRange = document.createRange();

    beforeRange.setStartBefore(element.firstChild || element);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    afterRange.setStart(range.startContainer, range.startOffset);
    afterRange.setEndAfter(element.lastChild || element);

    const beforeContainer = document.createElement('div');
    const afterContainer = document.createElement('div');

    beforeContainer.appendChild(beforeRange.cloneContents());
    afterContainer.appendChild(afterRange.cloneContents());

    return [
      this.cleanHtml(beforeContainer.innerHTML),
      this.cleanHtml(afterContainer.innerHTML)
    ];
  }

  mergeBlocks(targetIndex: number, sourceIndex: number): number {
    const blocksArray = this.getBlocksArray();
    const targetBlock = blocksArray.at(targetIndex) as FormGroup;
    const sourceBlock = blocksArray.at(sourceIndex) as FormGroup;

    const targetContent = targetBlock.get('content')?.value || '';
    const sourceContent = sourceBlock.get('content')?.value || '';
    const cursorPosition = targetContent.length;

    targetBlock.patchValue({ content: targetContent + sourceContent });
    blocksArray.removeAt(sourceIndex);

    const targetBlockId = targetBlock.get('blockId')?.value;
    if (targetBlockId) {
      this.setCurrentBlockId(targetBlockId);
    }

    return cursorPosition;
  }

  isCursorAtStart(element: HTMLElement, range: Range): boolean {
    const beforeRange = document.createRange();
    beforeRange.setStart(element, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    const temp = document.createElement('div');
    temp.appendChild(beforeRange.cloneContents());

    return !temp.textContent?.trim() && !temp.querySelector('img');
  }

  focusAtPosition(element: HTMLElement, cursorPosition: number): void {
    const selection = window.getSelection();
    const range = document.createRange();

    if (cursorPosition >= element.innerHTML.length) {
      range.selectNodeContents(element);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );

    let currentPos = 0;
    let currentNode: any = walker.nextNode();

    while (currentNode) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as Element).tagName === 'IMG') {
        if (currentPos === cursorPosition) {
          const parentEl = currentNode.parentElement;
          if (parentEl) {
            const index = Array.from(parentEl.childNodes).indexOf(currentNode);
            range.setStart(parentEl, index);
            range.setEnd(parentEl, index);
            break;
          }
        }
        currentPos += (currentNode as Element).outerHTML.length;
      }
      else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent) {
        const length = currentNode.textContent.length;
        if (currentPos + length >= cursorPosition) {
          range.setStart(currentNode, cursorPosition - currentPos);
          range.setEnd(currentNode, cursorPosition - currentPos);
          break;
        }
        currentPos += length;
      }
      currentNode = walker.nextNode();
    }

    if (!range.startContainer) {
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  mergeWithPreviousBlock(currentIndex: number): void {
    const cursorPosition = this.mergeBlocks(
      currentIndex - 1,
      currentIndex
    );

    this.focusInstruction.next({
      index: currentIndex - 1,
      cursorPosition
    });
  }
}
