import { Component, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe, NgForOf, CommonModule } from '@angular/common';
import { EditableContainerComponent } from '../editable-container/editable-container.component';
import { HeaderComponent } from '../header/header.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ToolbarState } from '../../models/toolbar.models';
import { ToolbarStateService } from '../../services/toolbar.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rich-document',
  templateUrl: './rich-document.component.html',
  styleUrls: ['./rich-document.component.scss'],
  imports: [
    RouterModule, NgForOf, CommonModule, HeaderComponent, ToolbarComponent, EditableContainerComponent,
    AsyncPipe,
    EditableContainerComponent,
    HeaderComponent,
    ToolbarComponent
  ],
  standalone: true
})
export class RichDocumentComponent {
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
}
