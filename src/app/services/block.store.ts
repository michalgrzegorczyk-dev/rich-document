import { Injectable, signal } from '@angular/core';
import { Block } from '../models/block.models';

@Injectable({
  providedIn: 'root'
})
export class BlockStore {
  blocks = signal<Block[]>([]);

  private nextId = 1;

  createBlock(): void {
    const newBlock :Block= {
      id: this.nextId++,
      type: 'text',
      content: ''
    };

    this.blocks.set([...this.blocks(), newBlock]);
  }

  removeBlock(index: number) {
    this.blocks.set(this.blocks().filter((_:Block, i:number) => i !== index));
  }
}
