import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { HeaderComponent } from '../header/header.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ToolbarManager } from '../../services/toolbar-manager';
import { BlockStore } from '../../services/block.store';
import { KeyboardService } from '../../utils/keyboard/keyboard.service';
import { FocusManager } from '../../services/focus-manager';
import { ToolbarStateService } from '../../services/toolbar.service';

const COMPONENTS = [HeaderComponent, ToolbarComponent, EditorComponent, EditorComponent];
const DIRECTIVES = [NgForOf, AsyncPipe];

@Component({
  selector: 'app-rich-document',
  templateUrl: './rich-document.component.html',
  styleUrls: ['./rich-document.component.scss'],
  imports: [...COMPONENTS, ...DIRECTIVES],
  standalone: true
})
export class RichDocumentComponent implements OnInit {
  toolbarStateService = inject(ToolbarStateService);
  readonly #blockService = inject(BlockStore);
  readonly #keyboardManager = inject(KeyboardService);
  readonly #toolbarManager = inject(ToolbarManager);
  readonly #focusManager = inject(FocusManager);

  ngOnInit(): void {
    this.#keyboardManager.enterPressed$.subscribe((index) => {
      this.#blockService.createBlock();
      this.#focusManager.requestFocus(index + 1);
    });

    this.#keyboardManager.backspacePressed$.subscribe((index) => {
      // todo check if there is text
      this.#blockService.removeBlock(index);
      this.#focusManager.requestFocus(index - 1);
    });
  }

  toolbarAction(event: { type: string, value: string }) {
    console.log(`Toolbar action: ${event.type} - ${event.value}`);
    switch (event.type) {
      case 'format':
        document.execCommand(event.value, false);
        break;
      case 'image':
        console.log('Image things.');
        break;
      case 'code':
        console.log('Code things.');
        break;
    }
  }

  protected onBlockAction(event: { type: string, blockId: string, data?: any }) {
    switch (event.type) {
      case 'click':
        this.#toolbarManager.handleClick(event.data as HTMLElement);
        break;
      case 'create':
        this.#blockService.createBlock();
        break;
      case 'keydown':
        this.#keyboardManager.handleKeyDown(event.data.event, event.data.index);
        break;
      default:
        console.warn('Unhandled block action:', event);
    }
  }
}
