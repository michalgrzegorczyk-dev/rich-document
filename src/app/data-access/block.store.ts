import { Injectable, signal } from '@angular/core';
import { Block } from './block.models';

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
    this.blocks.set(blocks);
    localStorage.setItem('blocks', JSON.stringify(blocks));
  }
}
