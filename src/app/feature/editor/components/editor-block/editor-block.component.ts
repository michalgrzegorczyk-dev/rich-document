import { ViewChild, Input, ElementRef, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContenteditableValueAccessorDirective } from '../../../../util/contenteditable-value-accessor.directive';
import { EditorService } from '../../editor.service';
import { ToolbarStateService } from '../../../../ui/toolbar/toolbar.service';
import { EditorCommandFactory } from '../../commands/editor-command.factory';

@Component({
  selector: 'app-editor-block',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorDirective
  ],
  templateUrl: './editor-block.component.html',
  styleUrls: ['./editor-block.component.scss']
})
export class EditorBlockComponent {
  @ViewChild('editableDiv')
  editableDiv!: ElementRef<HTMLDivElement>;

  @Input({ required: true })
  blockForm!: FormGroup;

  @Input({ required: true })
  index!: number;

  toolbarService = inject(ToolbarStateService);
  #editorService = inject(EditorService);

  get blockId(): string {
    return this.blockForm.value.blockId;
  }

  onKeydown(event: KeyboardEvent): void {
    this.handleKeydown(event, this.index);
  }

  onClick(event: MouseEvent): void {
    // TODO: Temp.
    this.#editorService.setCurrentBlockId(this.blockId);

    console.log(event.target);

    // Is selected? Only text considered NOW.
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // Text only.
      this.toolbarService.showToolbar('text', this.blockId);
      return;
    }

    if (event.target instanceof HTMLImageElement) {
      const imageId = event.target.dataset['imageId'];

      // TODO: Temp.
      if (imageId) {
        this.#editorService.setCurrentImageId(imageId);
      }

      this.toolbarService.showToolbar('image', this.blockId);
    }
  }

  private handleKeydown(event: KeyboardEvent, index: number): void {
    const factory = new EditorCommandFactory(this.#editorService);
    const command = factory.getCommand(event.key);

    if (command) {
      command.execute(event, index, event.target as HTMLElement);
    }
  }
}
