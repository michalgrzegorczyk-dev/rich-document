import {
  Component,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  HostListener,
  ElementRef, inject
} from '@angular/core';
import { NgIf, AsyncPipe, NgStyle } from '@angular/common';
import { ToolbarStateService } from './toolbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [NgIf, AsyncPipe, NgStyle]
})
export class ToolbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('toolbarHost', { read: ViewContainerRef })
  toolbarHost!: ViewContainerRef;

  @ViewChild('toolbarWrapper')
  toolbarWrapper!: ElementRef;

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.toolbarService.clearToolbar();
    }
  }

  readonly toolbarService = inject(ToolbarStateService);
  readonly elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    this.toolbarService.setHost(this.toolbarHost);
  }

  ngOnDestroy(): void {
    this.toolbarService.clearToolbar();
  }
}
