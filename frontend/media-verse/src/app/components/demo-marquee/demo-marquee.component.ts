import { Component, inject } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-demo-marquee',
  imports: [AsyncPipe],
  templateUrl: './demo-marquee.component.html',
  styleUrl: './demo-marquee.component.scss',
})
export class DemoMarqueeComponent {
  contentService = inject(ContentService);
  popularMovies$ = this.contentService.getPopularMovies$();
  popularSeries$ = this.contentService.getPopularSeries$();
}
