import {
  AfterViewInit,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  OnDestroy,
  Renderer2,
  inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorService } from '../feature/editor/editor.service';

@Directive({
  standalone: true,
  selector: '[contenteditable][formControlName], [contenteditable][formControl], [contenteditable][ngModel]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ContenteditableValueAccessorDirective),
    multi: true,
  }],
})
export class ContenteditableValueAccessorDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private onTouched = () => {};
  private onChange = (_value: string) => {};
  private observer!: MutationObserver;
  private readonly editorService = inject(EditorService);

  constructor(
    @Inject(ElementRef) private readonly elementRef: ElementRef<Element>,
    @Inject(Renderer2) private readonly renderer: Renderer2,
  ) {
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'contenteditable',
      'true'
    );
  }

  ngAfterViewInit() {
    this.setupObserver();
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private cleanAndNotify() {
    const html = this.elementRef.nativeElement.innerHTML;
    const cleanHtml = this.editorService.cleanHtml(html);

    if (cleanHtml !== html) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', cleanHtml);
    }

    this.onChange(cleanHtml);
  }

  private setupObserver() {
    this.observer = new MutationObserver(() => {
      this.cleanAndNotify();
    });

    this.observer.observe(this.elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  @HostListener('input')
  onInput() {
    this.observer.disconnect();
    this.cleanAndNotify();
    this.setupObserver();
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  writeValue(value: string) {
    const cleanValue = this.editorService.cleanHtml(value || '');
    this.renderer.setProperty(
      this.elementRef.nativeElement,
      'innerHTML',
      cleanValue
    );
  }

  registerOnChange(onChange: (value: string) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'contenteditable',
      String(!disabled)
    );
  }
}
