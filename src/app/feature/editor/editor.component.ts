import {
  Component, Output, EventEmitter, ViewChildren,
  QueryList, AfterViewInit, OnInit, inject, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, filter, map, withLatestFrom, tap } from 'rxjs';
import { EditorService } from './editor.service';
import { EditorBlocks, BlockEvent, FocusInstruction } from './models/editor.models';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { EditorBlockComponent } from './components/editor-block/editor-block.component';
import { ContenteditableValueAccessorDirective } from '../../util/contenteditable-value-accessor.directive';
import { Block } from '../../data-access/block.models';
import { ToolbarStateService } from '../../ui/toolbar/toolbar.service';
import { generateRandomStringId } from '../../util/id-generator';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ContenteditableValueAccessorDirective,
    EditorBlockComponent,
    ToolbarComponent
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {
  @ViewChildren(EditorBlockComponent)
  blockRefs!: QueryList<EditorBlockComponent>;

  @Output()
  editorBlocksChange = new EventEmitter<EditorBlocks>();

  @Input()
  set editorBlocks(blocks: Block[]) {
    if (this.firstTime) {
      this.#editorService.initializeForm(blocks);
      this.firstTime = false;
    }
  }

  toolbarService = inject(ToolbarStateService);
  readonly #editorService = inject(EditorService);

  readonly #focusInstruction = this.#editorService.focusInstruction;
  readonly focusInstruction$ = this.#editorService.focusInstruction$;


  firstTime = true;

  get formGroup() {
    return this.#editorService.getFormGroup();
  }

  get blocksFromArray() {
    return this.#editorService.getBlocksArray();
  }

  ngOnInit(): void {
    this.toolbarService.actionChanged$.subscribe((event: { type: string, value: string, blockId: string }) => {
      if (event.type === 'text') {
        document.execCommand(event.value, false);
      }

      if (event.type === 'image') {
        const block = this.blocksFromArray.controls.find(control =>
          control.get('blockId')?.value === event.blockId
        );

        if (block) {
          const divElement = this.blockRefs.find((ref, index) =>
            this.blocksFromArray.at(index).get('blockId')?.value === event.blockId
          )?.editableDiv.nativeElement;

          if (divElement) {
            const imageId = this.#editorService.currentImageId().imageId;
            const image:any = divElement.querySelector(`img[data-image-id="${imageId}"]`);

            if (image) {
              const currentWidth = image.width || image.offsetWidth;
              const currentHeight = image.height || image.offsetHeight;

              if (event.value === 'resize25') {
                image.style.width = `${currentWidth * 1.25}px`;
                image.style.height = `${currentHeight * 1.25}px`;
              }
              if (event.value === 'resize50') {
                image.style.width = `${currentWidth * 1.5}px`;
                image.style.height = `${currentHeight * 1.5}px`;
              }

              block.patchValue({
                content: divElement.innerHTML
              }, { emitEvent: true });
            }
          }
        }
      }
    });

    this.formGroup.valueChanges.pipe(
      tap(value => console.log('value', value)),
      debounceTime(1_000),
      tap(formValue => {
        if (!formValue?.blocks) return;

        formValue.blocks.forEach((block: any, index: number) => {
          if (block?.content?.includes('<img')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = block.content;
            let hasChanges = false;

            tempDiv.querySelectorAll('img:not([data-image-id])').forEach(img => {
              img.setAttribute('data-image-id', `img-${generateRandomStringId()}`);
              hasChanges = true;
            });

            if (hasChanges) {
              const blockControl = this.blocksFromArray.at(index);
              blockControl.patchValue({ content: tempDiv.innerHTML }, { emitEvent: false });
            }
          }
        });
      }),
      map(() => this.#editorService.mapToEditorBlocks(this.formGroup.value))
    ).subscribe(value => {
      this.editorBlocksChange.emit(value);
    });
  }

  ngAfterViewInit(): void {
    this.blockRefs.changes.pipe(
      withLatestFrom(this.focusInstruction$),
      filter(([_, instruction]) => instruction !== null)
    ).subscribe(([_, instruction]) => {
      if (instruction) {
        this.focusBlock(instruction.index, instruction.cursorPosition);
        this.#focusInstruction.next(null);
      }
    });
  }

  private focusBlock(index: number, cursorPosition?: number): void {
    const element = this.blockRefs.get(index)?.editableDiv.nativeElement;
    if (!element) return;

    element.focus();
    if (typeof cursorPosition === 'number') {
      this.#editorService.focusAtPosition(element, cursorPosition);
    }
  }
}
