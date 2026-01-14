import { NgClass } from '@angular/common';
import { Component, input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-trailer',
  imports: [NgClass],
  templateUrl: './trailer.component.html',
  styleUrl: './trailer.component.scss',
})
export class TrailerComponent implements OnChanges {
  originalTrailerUrl = input.required<string>();
  safeTrailerUrl!: SafeResourceUrl | null;
  isTrailerOpen: boolean = false;
  isTrailerVisible: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.isTrailerOpen = JSON.parse(
      localStorage.getItem('content-detail-trailer-open') ?? 'false'
    );
    if (this.isTrailerOpen) {
      this.isTrailerVisible = true;
    }
    this.safeTrailerUrl = this.buildSafeTrailerUrl(this.originalTrailerUrl());
  }

  toggleTrailer() {
    if (this.isTrailerOpen) {
      this.isTrailerOpen = false;
      localStorage.setItem('content-detail-trailer-open', 'false');

      setTimeout(() => {
        this.isTrailerVisible = false;
      }, 400);
    } else {
      this.isTrailerVisible = true;
      localStorage.setItem('content-detail-trailer-open', 'true');

      requestAnimationFrame(() => {
        this.isTrailerOpen = true;
      });
    }
  }

  private buildSafeTrailerUrl(url?: string | null): SafeResourceUrl | null {
    if (!url) return null;

    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      url = `https://www.youtube.com/embed/${videoId}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
