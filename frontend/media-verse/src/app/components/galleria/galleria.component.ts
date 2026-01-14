import { NgClass } from '@angular/common';
import { Component, input, OnChanges } from '@angular/core';
import { DragscrollDirective } from '../../directives/dragscroll.directive';

@Component({
  selector: 'app-galleria',
  imports: [NgClass, DragscrollDirective],
  templateUrl: './galleria.component.html',
  styleUrl: './galleria.component.scss',
})
export class GalleriaComponent implements OnChanges {
  backDrops = input<string[]>([]);
  activeImg = '';
  isGalleriaOpen: boolean = false;

  ngOnChanges() {
    this.isGalleriaOpen = JSON.parse(
      localStorage.getItem('content-detail-galleria-open') ?? 'false'
    );
    this.activeImg = this.backDrops()[0];
  }

  openBackdrop(url: string) {
    this.backDrops().find((b) => b === url);
    this.activeImg = url;
  }

  toggleGalleria() {
    this.isGalleriaOpen = !this.isGalleriaOpen;
    localStorage.setItem(
      'content-detail-galleria-open',
      this.isGalleriaOpen.toString()
    );
  }
}
