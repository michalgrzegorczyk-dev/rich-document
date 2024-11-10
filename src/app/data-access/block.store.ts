import { Injectable, signal } from '@angular/core';
import { Block } from './block.models';
import { generateRandomStringId } from '../util/id-generator';

@Injectable({
  providedIn: 'root'
})
export class BlockStore {
  readonly blocks = signal<Block[]>([]);

  constructor() {
    const blocks = localStorage.getItem('blocks');
    if (blocks) {
      this.blocks.set(JSON.parse(blocks));
    }
  }

  setBlocks(blocks: any) {
    const validatedBlocks:any = blocks.map((block:any) => {
      if (!block.id) {
        return {
          ...block,
          id: generateRandomStringId(),
        };
      }
      return block;
    });

    this.blocks.set(validatedBlocks);
    localStorage.setItem('blocks', JSON.stringify(validatedBlocks));
  }
}
