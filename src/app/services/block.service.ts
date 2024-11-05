import { Injectable } from '@angular/core';
import { Block } from '../models/block.models';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private nextId = 1;

  createBlock(): Block {
    return {
      id: this.nextId++,
      type: 'text',
      content: ''
    };
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
}
