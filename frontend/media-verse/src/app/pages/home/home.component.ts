import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { Movie } from '../../models/movie';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { Series } from '../../models/series';
import { SeriesService } from '../../services/series.service';
import { SeriesCardComponent } from '../../components/series-card/series-card.component';
import { DragscrollDirective } from '../../directives/dragscroll.directive';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    ToggleSwitchModule,
    FormsModule,
    MovieCardComponent,
    SeriesCardComponent,
    DragscrollDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  popularMovies$: Movie[] = [];
  topRatedMovies$: Movie[] = [];

  popularSeries$: Series[] = [];
  topRatedSeries$: Series[] = [];

  movieService = inject(MovieService);
  seriesService = inject(SeriesService);

  checked: boolean = false;
  themeService = inject(ThemeService);

  ngOnInit() {
    this.movieService.getPopularMovies().subscribe((data) => {
      this.popularMovies$ = data.results.map((movie) => ({
        ...movie,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
      }));
    });

    this.movieService.getTopRatedMovies().subscribe((data) => {
      this.topRatedMovies$ = data.results.map((movie) => ({
        ...movie,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
      }));
    });

    this.seriesService.getPopularSeries().subscribe((data) => {
      this.popularSeries$ = data.results.map((series) => ({
        ...series,
        poster_path: series.poster_path
          ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
          : null,
      }));
    });

    this.seriesService.getTopRatedSeries().subscribe((data) => {
      this.topRatedSeries$ = data.results.map((series) => ({
        ...series,
        poster_path: series.poster_path
          ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
          : null,
      }));
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
