import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, NgForOf, JsonPipe } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { HeaderComponent } from '../../ui/header/header.component';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { BlockStore } from '../../data-access/block.store';
import { DomHelper } from '../../util/dom/dom-helper';
import { ToolbarActionInput } from '../../ui/toolbar/toolbar.models';
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
export class RichDocumentComponent implements OnInit {
  readonly #blockStore = inject(BlockStore);

  blocks = this.#blockStore.blocks;

  ngOnInit(): void {
    this.#blockStore.createBlock();
  }

  onUpdateBlocks($event: EditorBlocks) {
    this.#blockStore.setBlocks($event.blocks);
  }
}
