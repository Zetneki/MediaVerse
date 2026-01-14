import { Component, input, Input } from '@angular/core';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';
import { SeriesCardComponent } from '../series-card/series-card.component';

@Component({
  selector: 'app-discover-list',
  imports: [MovieCardComponent, SkeletonCardComponent, SeriesCardComponent],
  templateUrl: './discover-list.component.html',
  styleUrl: './discover-list.component.scss',
})
export class DiscoverListComponent {
  items = input<any[]>([]);
  isLoading = input(false);
  type = input<'movies' | 'series'>('movies');
}
