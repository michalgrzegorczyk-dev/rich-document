import { Component, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { ToolbarState } from './toolbar.models';
import { ToolbarStateService } from './toolbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [NgIf, AsyncPipe],
  standalone: true
})
export class ToolbarComponent {
  @Output() toolbarAction = new EventEmitter<{type: string, value: string}>();

  toolbarStateService = inject(ToolbarStateService);
  cdr = inject(ChangeDetectorRef);
  state$ = this.toolbarStateService.state$;

  selectedImageElement: HTMLImageElement | null = null;

  toolbarState: ToolbarState = {
    show: false,
    isTextSelection: false,
    isImageSelected: false,
    isCodeBlock: false,
    position: { top: 0, left: 0 }
  };


  handleAction(type: string, value: string) {
    console.log(`Toolbar action: ${type} - ${value}`);
    this.toolbarActionx({ type, value });
  }

  toolbarActionx(event: {type: string, value: string}) {

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



  private handleImageOptions(value: string): void {
    console.log("Image options clicked:", value);
    if (this.selectedImageElement) {
      this.showImageEditingToolbar(this.selectedImageElement);
    } else {
      console.log("No image is selected when trying to access image options.");
    }
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

}
