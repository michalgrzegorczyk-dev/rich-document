import { Component, inject, } from '@angular/core';
import { AsyncPipe, NgForOf, JsonPipe } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { HeaderComponent } from '../../ui/header/header.component';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { BlockStore } from '../../data-access/block.store';
import { EditorBlocks } from '../editor/editor.models';

const COMPONENTS = [HeaderComponent, ToolbarComponent, EditorComponent, EditorComponent];
const DIRECTIVES = [NgForOf, AsyncPipe];

@Component({
  selector: 'app-rich-document',
  templateUrl: './rich-document.component.html',
  styleUrls: ['./rich-document.component.scss'],
  imports: [...COMPONENTS, ...DIRECTIVES, JsonPipe],
  standalone: true
})
export class RichDocumentComponent {
  readonly #blockStore = inject(BlockStore);

  blocks = this.#blockStore.blocks;

  onUpdateBlocks($event: EditorBlocks) {
    this.#blockStore.setBlocks($event.blocks);
  }
}
