import { Component, inject, } from '@angular/core';
import { AsyncPipe, NgForOf, JsonPipe } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { HeaderComponent } from '../../ui/header/header.component';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { BlockStore } from '../../data-access/block.store';
import { EditorBlocks } from '../editor/models/editor.models';
import { EditorService } from '../editor/editor.service';

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

  editorService = inject(EditorService);

  blocks = this.#blockStore.blocks;

  onUpdateBlocks($event: EditorBlocks) {
    console.log('RichDocumentComponent.onUpdateBlocks', $event);
    this.#blockStore.setBlocks($event.blocks);
  }
}
