import { Directive, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { SelectionService, SelectionInfo } from './selection.service';

@Directive({
  selector: '[appSelectionTracker]',
  standalone: true,
})
export class SelectionTrackerDirective {
  private readonly selectionService = inject(SelectionService);

  @Output() selectionChange = new EventEmitter<SelectionInfo>();

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    const selectionInfo = this.selectionService.handleTextSelection(event);
    if (selectionInfo) {
      this.selectionChange.emit(selectionInfo);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const selectionInfo = this.selectionService.handleElementClick(event);
    if (selectionInfo) {
      this.selectionChange.emit(selectionInfo);
    }
  }
}
