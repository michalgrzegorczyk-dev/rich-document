import {
  Component,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgForOf, CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { EditableContainerComponent } from './editable-container/editable-container.component';
import { ToolbarStateService } from './toolbar.service';

interface ToolbarState {
  show: boolean;
  isTextSelection: boolean;
  isImageSelected: boolean;
  isCodeBlock: boolean;
  position: { top: number; left: number };
}

@Component({
  standalone: true,
  imports: [RouterModule, NgForOf, CommonModule, ToolbarComponent, EditableContainerComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedImageElement: HTMLImageElement | null = null;

  toolbarState: ToolbarState = {
    show: false,
    isTextSelection: false,
    isImageSelected: false,
    isCodeBlock: false,
    position: { top: 0, left: 0 }
  };

  constructor(
    private cdr: ChangeDetectorRef,
    public toolbarStateService: ToolbarStateService
  ) {}

  toolbarAction(event: {type: string, value: string}) {

    console.log(`Toolbar action: ${event.type} - ${event.value}`); // General log for any toolbar action
    switch (event.type) {
      case 'format':
        this.formatText(event.value as 'bold' | 'italic');
        break;
      case 'image':
        this.handleImageOptions(event.value);
        break;
      case 'code':
        this.handleCodeOptions(event.value);
        break;
    }
  }

  formatText(format: 'bold' | 'italic') {
    document.execCommand(format, false);
  }

  private handleCodeOptions(value: string) {

  }

  private showImageEditingToolbar(imageElement: HTMLImageElement): void {
    console.log("Displaying image editing toolbar for:", imageElement.src);
    // Here you can expand functionality, for now, it logs the action
    const rect = imageElement.getBoundingClientRect();
    this.toolbarState = {
      show: true,
      isTextSelection: false,
      isImageSelected: true,
      isCodeBlock: false,
      position: { top: rect.bottom + 10, left: rect.left }
    };
    this.cdr.detectChanges();
  }
  private handleImageOptions(value: string): void {
    console.log("Image options clicked:", value);
    if (this.selectedImageElement) {
      this.showImageEditingToolbar(this.selectedImageElement);
    } else {
      console.log("No image is selected when trying to access image options.");
    }
  }

  handleEdit(event: { type: string; content: string; index: number }) {
    switch (event.type) {
      case 'text':
        console.log('Text edited:', event.content);
        break;
      case 'image':
        console.log('Image added/edited:', event.content);
        break;
      case 'code':
        console.log('Code block edited:', event.content);
        break;
    }
  }

  updateToolbar(state: ToolbarState) {
    this.toolbarState = {
      ...state,
      position: this.adjustToolbarPosition(state.position)
    };

    this.cdr.detectChanges();
  }

  private adjustToolbarPosition(position: { top: number; left: number }) {
    const toolbarWidth = 200;
    const toolbarHeight = 40;
    const padding = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.left;
    if (left + toolbarWidth > viewportWidth - padding) {
      left = viewportWidth - toolbarWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    let top = position.top;
    if (top < padding) {
      top = position.top + toolbarHeight + padding;
    }
    if (top + toolbarHeight > viewportHeight - padding) {
      top = viewportHeight - toolbarHeight - padding;
    }

    return { top, left };
  }
}
