import { ElementRef } from '@angular/core';
import { DragscrollDirective } from './dragscroll.directive';

describe('DragscrollDirective', () => {
  it('should create an instance', () => {
    const el = { nativeElement: {} } as ElementRef;
    const renderer = jasmine.createSpyObj('Renderer2', ['listen']);
    const directive = new DragscrollDirective(el, renderer);
    expect(directive).toBeTruthy();
  });
});
