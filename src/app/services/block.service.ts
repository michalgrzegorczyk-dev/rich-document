import { Injectable, signal } from '@angular/core';
import { Block } from '../models/block.models';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
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

  isCodeContent(text: string): boolean {
    const codeIndicators = [
      '{', '}', ';', '//', '/*', '*/',
      'function', 'const', 'let', 'var',
      'class', 'import', 'export',
      '</', '/>'
    ];
    return codeIndicators.some(indicator => text.includes(indicator)) &&
      text.split('\n').length > 1;
  }

  removeBlock(index: number) {
    this.blocks.set(this.blocks().filter((_:Block, i:number) => i !== index));
  }
}
