import { ViewChild, Input, ElementRef, Component, inject, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContenteditableValueAccessorDirective } from '../../../../util/contenteditable-value-accessor.directive';
import { EditorService } from '../../editor.service';
import { EditorCommandFactory } from '../../commands/editor-command.factory';
import { ClickStrategyFactory } from '../../strategy/click-strategy.factory';
import { generateRandomStringId } from '../../../../util/id-generator';
import { ToolbarComponent } from '../../../../ui/toolbar/toolbar.component';
// import { Toolbar2Service } from '../../../../ui/toolbar/toolbar2.service';

@Component({
  selector: 'app-editor-block',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective,
    ToolbarComponent,

  ],
  templateUrl: './editor-block.component.html',
  styleUrls: ['./editor-block.component.scss']
})
export class EditorBlockComponent {
  @ViewChild('editableDiv')
  editableDiv!: ElementRef<HTMLDivElement>;

  @Input({ required: true })
  blockGroupForm!: FormGroup;

  @Input({ required: true })
  index!: number;

  #editorService = inject(EditorService);
  editorCommandFactory = inject(EditorCommandFactory);
  clickStrategyFactory = inject(ClickStrategyFactory);

  isId = computed(() =>{
    if(this.blockGroupForm.value.blockId === this.#editorService.currentBlockId().blockId){
      return true;
    }
    return false;
  });

  get blockId(): string {
    return this.blockGroupForm.value.blockId;
  }

  onKeydown(event: KeyboardEvent): void {
    console.log('keydown')
    const command = this.editorCommandFactory.getCommand(event.key);

    if (command) {
      command.execute(event, this.index, event.target as HTMLElement);
    }

  }

  onClick(event: MouseEvent): void {
    if(this.isId() === this.blockGroupForm.value.blockId){
      return;
    }
    this.#editorService.clearPreviousHighlight();
    this.#editorService.setCurrentBlockId(this.blockId);

    const clickStrategy = this.clickStrategyFactory.getStrategy(event);

    if (clickStrategy) {
      clickStrategy.handle(event, this.blockId);
    }
  }

  onPaste(event: ClipboardEvent): void {
    console.log('paste');
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Handle images
    if (clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];

        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.handleImagePaste(file);
            return; // Exit after handling image
          }
        }
      }
    }

    // Handle text paste
    const text = clipboardData.getData('text/plain');
    if (text) {
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.collapse(false);
      }
    }
  }

  private handleImagePaste(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      // Create image element
      const img = document.createElement('img');
      img.draggable = false;
      img.src = e.target?.result as string;
      const newBlockId = generateRandomStringId();

      const blocksArray = this.#editorService.getBlocksArray();

      const isEmpty = blocksArray.at(this.index).get('content')?.value === '' || blocksArray.at(this.index).get('content')?.value === '<br>' ;

      const newIndex = isEmpty ? this.index : this.index + 1;
      console.log('index ', newIndex);

      // Create wrapper div for the image
      const wrapper = document.createElement('div');
      wrapper.appendChild(img);

      // Insert new block with the image
      if(!isEmpty){
        console.log('NOT EMPTY')
        blocksArray.insert(newIndex, this.#editorService.createImageBlock(wrapper.innerHTML, newBlockId));
        this.#editorService.focusInstruction.next({
          index: newIndex,
          cursorPosition: 0
        });
        this.#editorService.setCurrentBlockId(newBlockId);

      } else {
        console.log('NOT EMPTY')
        // this.#editorService.createImageBlock(wrapper.innerHTML, newBlockId);
        // this.#editorService.setCurrentBlockId(newBlockId);
        blocksArray.at(this.index).patchValue({ content: wrapper.innerHTML });
        this.#editorService.focusInstruction.next({
          index: newIndex,
          cursorPosition: 0
        });
      }

      // Create an empty block after the image if it's not the last block
      // const emptyBlockId = generateRandomStringId();
      //
      // // Update service with new IDs
      // this.#editorService.setCurrentBlockId(emptyBlockId);

      // Focus on the empty block

    };

    reader.readAsDataURL(file);
  }

}
