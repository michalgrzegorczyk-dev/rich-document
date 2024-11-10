import {
  Component, Output, EventEmitter, ViewChildren,
  QueryList, AfterViewInit, OnInit, inject, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, filter, map, withLatestFrom, tap } from 'rxjs';
import { EditorService } from './editor.service';
import { EditorBlocks } from './models/editor.models';
import { ToolbarComponent } from '../../ui/toolbar/toolbar.component';
import { EditorBlockComponent } from './components/editor-block/editor-block.component';
import { ContenteditableValueAccessorDirective } from '../../util/contenteditable-value-accessor.directive';
import { Block } from '../../data-access/block.models';
import { ToolbarService } from '../../ui/toolbar/toolbar.service';
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
    ToolbarComponent,
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

  toolbarService = inject(ToolbarService);
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
      console.log(event);
      if (event.type === 'text') {
        if (event.value === 'h1' || event.value === 'h2' || event.value === 'h3' || event.value === 'p') {
          document.execCommand('formatBlock', false, `<${event.value}>`);
        } else {
          document.execCommand(event.value, false);
        }
      }

      if (event.type === 'image') {
        // Find the block by id
        const block = this.blocksFromArray.controls.find(control =>
          control.get('blockId')?.value === event.blockId
        );


        if (!block) return;

        // Find the editable div for this block

        const blockComponent = this.blockRefs.find((ref:any) => {

          return ref.blockGroupForm.get('blockId')?.value === event.blockId
        });
        const divElement = blockComponent?.editableDiv.nativeElement;



        if (!divElement) return;

        // Find the image in this block
        const image = divElement.querySelector('img') as HTMLImageElement;



        if (image) {
          const currentWidth = image.width || image.offsetWidth;
          const currentHeight = image.height || image.offsetHeight;

          switch(event.value) {
            case 'resize25':
              image.style.width = `${currentWidth * 1.25}px`;
              image.style.height = `${currentHeight * 1.25}px`;
              break;
            case 'resize50':
              image.style.width = `${currentWidth * 1.5}px`;
              image.style.height = `${currentHeight * 1.5}px`;
              break;
            // Add other resize cases as needed
          }

          // Update form value to save the changes
          block.patchValue({
            content: divElement.innerHTML
          }, { emitEvent: true });
        }
      }
    });


    this.formGroup.valueChanges.subscribe((value:any) => {
      //save

      this.editorBlocksChange.emit(value);
    })
  }

  ngAfterViewInit(): void {
    this.focusInstruction$.subscribe(instruction => {


      if (instruction) {
        this.focusBlock(instruction.index, instruction.cursorPosition);
        this.#focusInstruction.next(null);
      }
    });

    this.blockRefs.changes.pipe(
      withLatestFrom(this.focusInstruction$),
      tap(() => {

      }),
      filter(([_, instruction]) => instruction !== null)
    ).subscribe(([_, instruction]) => {
      if (instruction) {
        this.focusBlock(instruction.index, instruction.cursorPosition);
        this.#focusInstruction.next(null);
      }
    });
  }

  private focusBlock(index: number, cursorPosition = 0): void {
    const element = this.blockRefs.get(index)?.editableDiv.nativeElement;

    if (!element) {
      return;
    }

    this.#editorService.focusAtPosition(element, cursorPosition);
  }
}
