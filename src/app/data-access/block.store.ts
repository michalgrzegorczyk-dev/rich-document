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
    // this.blocks.set([{
    //   id: '1',
    //   content: 'Hello, World!'
    // }]);
    if (blocks) {
      this.blocks.set(JSON.parse(blocks));
    }
  }

  setBlocks(blocks: any) {
    // Only generate IDs for new blocks that don't have one
    const validatedBlocks:any = blocks.map((block:any) => {
      if (!block.id) {
        return {
          ...block,
          id: generateRandomStringId()
        };
      }
      return block;
    });

    this.blocks.set(validatedBlocks);
    localStorage.setItem('blocks', JSON.stringify(validatedBlocks));
  }
}
