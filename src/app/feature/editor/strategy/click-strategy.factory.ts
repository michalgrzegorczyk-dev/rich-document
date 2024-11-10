import { EditorService } from '../editor.service';
import { ToolbarService } from '../../../ui/toolbar/toolbar.service';
import { ClickStrategy } from '../models/strategy.models';
import { Injectable } from '@angular/core';

class TextSelectionStrategy implements ClickStrategy {
  constructor(private toolbarService: ToolbarService, private editorService: EditorService) {}

  handle(event: MouseEvent, blockId: string): void {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.toolbarService.showToolbar('text', blockId, event);
    }
  }
}

class ImageClickStrategy implements ClickStrategy {
  constructor(private editorService: EditorService, private toolbarService: ToolbarService) {}

  handle(event: MouseEvent, blockId: string): void {
    const target = event.target as any;

    this.editorService.setCurrentEditedBlock(target.children[0])


    // const imageId = target.dataset['imageId'];
    // if (imageId) {
    //   this.editorService.setCurrentImageId(imageId);
      this.toolbarService.showToolbar('image', blockId, event);
    // }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClickStrategyFactory {
  constructor(private editorService: EditorService, private toolbarService: ToolbarService) {}

  getStrategy(event: MouseEvent): ClickStrategy | undefined {
    const target = event.target as HTMLElement;


    const selection = window.getSelection();

    if (target instanceof HTMLImageElement) {
      return new ImageClickStrategy(this.editorService, this.toolbarService);
    } else if (selection && selection.toString().length > 0) {
      return new TextSelectionStrategy(this.toolbarService, this.editorService);
    }

    return undefined;
  }
}

// getStrategy(event: MouseEvent): ClickStrategy | undefined {
//   const target = event.target as HTMLElement;
//   if (target instanceof HTMLImageElement) {
//     return new ImageClickStrategy(this.editorService, this.toolbarService);
//   } else if (target instanceof HTMLVideoElement) {
//     return new VideoClickStrategy(this.videoService);
//   } else if (target instanceof HTMLAnchorElement) {
//     return new HyperlinkClickStrategy(this.linkService);
//   } else if (window.getSelection()?.toString().length > 0) {
//     return new TextSelectionStrategy(this.toolbarService);
//   }
//   return undefined;
// }
