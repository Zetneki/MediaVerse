import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appDragscroll]',
})
export class DragscrollDirective implements OnInit, OnDestroy {
  isDragging = false;
  hasDragged = false;
  startX = 0;
  scrollLeft = 0;
  dragThreshold = 5;

  private clickListener?: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'grab');
  }

  ngOnInit() {
    this.clickListener = this.renderer.listen(
      this.el.nativeElement,
      'click',
      (event: MouseEvent) => {
        if (this.hasDragged) {
          event.preventDefault();
          event.stopPropagation();
          this.hasDragged = false;
        }
      },
      { capture: true }
    );
  }

  @HostListener('mousedown', ['$event'])
  onDragStart(event: MouseEvent) {
    event.preventDefault();

    this.isDragging = true;
    this.hasDragged = false;
    this.startX = event.clientX;
    this.scrollLeft = this.el.nativeElement.scrollLeft;

    this.renderer.addClass(this.el.nativeElement, 'dragging');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'grabbing');
  }

  @HostListener('dragstart', ['$event'])
  onNativeDragStart(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('mousemove', ['$event'])
  onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.startX;

    if (Math.abs(deltaX) > this.dragThreshold) {
      this.hasDragged = true;
      this.el.nativeElement.scrollLeft = this.scrollLeft - deltaX;
    }
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onDragEnd() {
    this.isDragging = false;
    this.renderer.removeClass(this.el.nativeElement, 'dragging');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'grab');
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}
