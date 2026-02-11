import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { SeriesCardComponent } from '../../components/series-card/series-card.component';
import { DragscrollDirective } from '../../directives/dragscroll.directive';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    ToggleSwitchModule,
    FormsModule,
    MovieCardComponent,
    SeriesCardComponent,
    DragscrollDirective,
    SkeletonCardComponent,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  contentService = inject(ContentService);

  skeletonArray = Array(20);

  checked: boolean = false;

  popularMovies$ = this.contentService.getPopularMovies$();
  topRatedMovies$ = this.contentService.getTopRatedMovies$();

  popularSeries$ = this.contentService.getPopularSeries$();
  topRatedSeries$ = this.contentService.getTopRatedSeries$();
}
