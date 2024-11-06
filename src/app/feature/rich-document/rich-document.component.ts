import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { HeaderComponent } from '../../ui/header/header.component';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { ToolbarManager } from '../../ui/toolbar/toolbar-manager';
import { BlockStore } from '../../data-access/block.store';
import { KeyboardService } from '../../util/keyboard/keyboard.service';
import { ToolbarStateService } from '../../ui/toolbar/toolbar.service';
import { DomHelper } from '../../util/dom/dom-helper';

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
  readonly #blockService = inject(BlockStore);
  readonly #keyboardManager = inject(KeyboardService);
  readonly #toolbarManager = inject(ToolbarManager);
  readonly #domHelper = inject(DomHelper);

  ngOnInit(): void {
    this.#keyboardManager.enterPressed$.subscribe((index) => {
      this.#blockService.createBlock();
      this.#domHelper.requestFocus(index + 1);
    });

    this.#keyboardManager.backspacePressed$.subscribe((index) => {
      // todo check if there is text
      this.#blockService.removeBlock(index);
      this.#domHelper.requestFocus(index - 1);
    });
  }

  onToolbarAction(event: { type: string, value: string }) {
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

  protected onEditorAction(event: { type: string, blockId: string, data?: any }) {
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
