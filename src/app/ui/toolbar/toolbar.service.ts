import { Injectable, ComponentRef, EnvironmentInjector, ViewContainerRef, inject } from '@angular/core';
import { ToolbarType } from './toolbar.models';
import { TextToolbarComponent } from './components/text-toolbar/text-toolbar.component';
import { Subject, BehaviorSubject } from 'rxjs';
import { ImageToolbarComponent } from './components/image-toolbar/image-toolbar.component';
import { BaseToolbarDirective } from './components/base-toolbar.directive';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private currentToolbar?: ComponentRef<any>;
  private toolbarHost?: ViewContainerRef;

  position$ = new BehaviorSubject<{ top: string, left: string }>({ top: '0', left: '0' });

  private toolbarMap: any = {
    'text': TextToolbarComponent,
    'image': ImageToolbarComponent
  } as const;

  injector = inject(EnvironmentInjector);
  isVisible$ = new BehaviorSubject<boolean>(false);
  actionChanged$ = new Subject<{ type: string, value: string; blockId: string }>();


  showToolbar(type: ToolbarType, blockId: string, targetElement:any) {
    if (!this.toolbarHost) {
      throw new Error('Toolbar host not set');
    }
    this.clearToolbar();

    const componentType = this.toolbarMap[type];
    if (!componentType) {
      throw new Error(`No toolbar component found for type: ${type}`);
    }

    const rect = targetElement.target.getBoundingClientRect();
    this.position$.next({
      top: `${rect.top }px`,
      left: `${rect.left}px`
    });


    this.currentToolbar = this.toolbarHost.createComponent(componentType, {
      injector: this.injector
    });


    const toolbarInstance = this.currentToolbar.instance as BaseToolbarDirective;



    toolbarInstance.action.subscribe((action: string) => {
      this.actionChanged$.next({ type, value: action, blockId});
    });


    this.currentToolbar.changeDetectorRef.detectChanges();
    this.isVisible$.next(true);
  }

  clearToolbar() {
    if (this.toolbarHost) {
      this.toolbarHost.clear();
    }
    this.currentToolbar = undefined;
    this.isVisible$.next(false);
  }

  setHost(viewContainerRef: ViewContainerRef) {
    this.toolbarHost = viewContainerRef;
  }

}
