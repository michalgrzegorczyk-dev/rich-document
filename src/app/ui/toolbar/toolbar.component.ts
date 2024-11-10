import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  HostListener,
  ElementRef, inject
} from '@angular/core';
import { NgIf, AsyncPipe, NgStyle } from '@angular/common';
import { ToolbarService } from './toolbar.service';

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

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.toolbarService.clearToolbar();
    }
  }

  readonly toolbarService = inject(ToolbarService);
  position$ = this.toolbarService.position$;
  readonly elementRef = inject(ElementRef);
  isVisible$ = this.toolbarService.isVisible$;


  ngAfterViewInit(): void {
    this.toolbarService.setHost(this.toolbarHost);
  }

  ngOnDestroy(): void {
    this.toolbarService.clearToolbar();
  }
}
