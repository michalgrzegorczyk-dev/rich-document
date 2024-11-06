import {
  Component,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  Signal,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { BlockEvent, Block } from '../../models/block.models';
import { ToolbarState } from '../../models/toolbar.models';
import { BlockService } from '../../services/block.service';
import { ToolbarStateService } from '../../services/toolbar.service';
import { ContentRendererService } from '../../services/content-renderer.service';
import { SelectionService } from '../../services/selection.service';
import { fromEvent, filter } from 'rxjs';
import { FocusManager } from '../../services/focus-manager';
import { BlockKeyboardManager } from '../../services/block-keyboard-manager';
import { PasteManager } from '../../services/paste-manager';
import { ToolbarManager } from '../../services/toolbar-manager';

export const EDITOR_SELECTORS = {
  EDITABLE: '.editable-div',
  TOOLBAR: '.floating-toolbar'
} as const;

@Component({
  selector: 'app-editable-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-container.component.html',
  styleUrls: ['./editable-container.component.scss']
})
export class EditableContainerComponent implements AfterViewInit, OnInit {
  @ViewChildren('editableDiv') editableDivRefs!: QueryList<ElementRef>;
  @Output() edit = new EventEmitter<BlockEvent>();
  @Output() toolbarStateChange = new EventEmitter<ToolbarState>();
  blocks: Signal<Block[]>;
  document = inject(DOCUMENT);
  private keyboardManager!: BlockKeyboardManager;
  private focusManager!: FocusManager;
  private pasteManager!: PasteManager;
  private toolbarManager!: ToolbarManager;

  constructor(
    private blockService: BlockService,
    private contentRenderer: ContentRendererService,
    private selectionService: SelectionService,
    private toolbarStateService: ToolbarStateService
  ) {
    this.blockService.createBlock();
    this.blocks = this.blockService.blocks;
  }

  ngOnInit() {
    this.focusManager = new FocusManager(
      this.selectionService,
      this.document
    );
    this.focusManager.setEditableDivRefs(this.editableDivRefs);

    fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => !this.isClickInside(event.target as Element))
      )
      .subscribe(() => {
        this.toolbarStateService.hideToolbar();
      });
  }

  ngAfterViewInit() {
    this.keyboardManager = new BlockKeyboardManager(
      this.blockService,
      this.focusManager,
      this.editableDivRefs
    );

    this.pasteManager = new PasteManager(
      this.blockService,
      this.contentRenderer,
      this.editableDivRefs,
      this.document,
      this.edit
    );

    this.toolbarManager = new ToolbarManager(
      this.selectionService,
      this.toolbarStateService
    );

    this.editableDivRefs.changes
      .pipe(
        filter(() => this.focusManager.hasPendingFocus())
      )
      .subscribe(() => {
        // Update refs when they change
        this.focusManager.setEditableDivRefs(this.editableDivRefs);
        const index = this.focusManager.getPendingIndex();
        if (index !== null) {
          this.focusManager.focusBlock(index);
        }
      });
  }

  createBlock(index: number): void {
    this.blockService.createBlock();
    this.focusManager.requestFocus(index + 1);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    this.keyboardManager.handleKeyDown(event, index);
  }


  onClick(event: MouseEvent) {
    this.toolbarManager.handleClick(event.target as HTMLElement);
  }

  onPaste(event: ClipboardEvent, index: number) {
    this.pasteManager.handlePaste(event, index);
  }

  private focusBlock(index: number): void {
    const divs = this.editableDivRefs.toArray();
    if (divs[index]) {
      const div = divs[index].nativeElement;
      div.focus();
      this.selectionService.focusAtEnd(div);
    }
  }

  private isClickInside(target: Element): boolean {
    return Boolean(
      target.closest(EDITOR_SELECTORS.EDITABLE) ||
      target.closest(EDITOR_SELECTORS.TOOLBAR)
    );
  }
}
