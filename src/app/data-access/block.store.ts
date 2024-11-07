import { Injectable, signal } from '@angular/core';
import { Block } from './block.models';

@Injectable({
  providedIn: 'root'
})
export class BlockStore {
  readonly blocks = signal<Block[]>([]);
  #nextId = 1; //todo make uuid

  constructor() {
    const blocks = localStorage.getItem('blocks');
    if (blocks) {
      this.blocks.set(JSON.parse(blocks));
    }
  }

  createBlock(): void {
    // const newBlock :Block= {
    //   id: this.#nextId++,
    //   type: 'text',
    //   content: ''
    // };

    // this.blocks.set([...this.blocks(), newBlock]);
  }

  removeBlock(index: number) {
    this.blocks.set(this.blocks().filter((_:Block, i:number) => i !== index));
  }

  setBlocks(blocks: any) {
    this.blocks.set(blocks);
    localStorage.setItem('blocks', JSON.stringify(blocks));
  }

  updateBlock(blockId: number, param2: { content: any }) {
    // this.blocks.update(() => this.blocks().map((block:Block) => {
    //   if (block.id === blockId) {
    //     console.log('Updating block:', blockId, param2);
    //
    //     return { ...block, content: block.content + param2.content };
    //   }
    //   return block;
    // }));
  }
}
