import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContentRendererService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  renderCodeBlock(container: HTMLElement, code: string): void {
    const pre = this.renderer.createElement('pre');
    const codeElement = this.renderer.createElement('code');

    this.renderer.addClass(pre, 'code-block');
    this.renderer.setProperty(codeElement, 'textContent', code);
    this.renderer.appendChild(pre, codeElement);
    this.renderer.appendChild(container, pre);
  }
}
