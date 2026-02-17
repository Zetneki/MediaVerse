import { Component, effect, inject, signal } from '@angular/core';
import { MovieProgressService } from '../../services/movie-progress.service';
import { SeriesProgressService } from '../../services/series-progress.service';
import { MovieProgress } from '../../models/movieprogress';
import { NotificationService } from '../../services/notification.service';
import { shouldHandleError } from '../../utils/error-handler';
import { AuthService } from '../../services/auth.service';
import { DiscoverDropdownComponent } from '../../components/discover-dropdown/discover-dropdown.component';
import { SelectOption } from '../../models/selectoption';
import { SeriesProgress } from '../../models/seriesprogress';

@Component({
  selector: 'app-library',
  imports: [DiscoverDropdownComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  authService = inject(AuthService);
  movies: MovieProgress[] = [];
  series: SeriesProgress[] = [];

  selectedTypeSignal = signal<SelectOption<'movies' | 'series'>>({
    label: 'Movies',
    value: 'movies',
  });

  constructor(
    private movieProgressService: MovieProgressService,
    private seriesProgressService: SeriesProgressService,
    private notificationService: NotificationService,
  ) {
    const saved = localStorage.getItem('library-selected-type');
    if (saved) {
      this.selectedTypeSignal.set(JSON.parse(saved));
    }

    effect(() => {
      const value = this.selectedTypeSignal();
      localStorage.setItem('library-selected-type', JSON.stringify(value));
    });

    this.movieProgressService.getMoviesProgress().subscribe((res) => {
      this.movies = res;
    });
    this.seriesProgressService.getSeriesProgress().subscribe((res) => {
      this.series = res;
    });
  }

  onDeleteMovieProgress(id: number) {
    this.movieProgressService.deleteMovieProgress(id).subscribe({
      next: (res: any) => {
        this.movies = this.movies.filter((m) => m.id !== id);
        this.notificationService.success(
          res.message ?? 'Movie progress successfully deleted',
        );
      },
      error: (err) => {
        if (!shouldHandleError(err)) return;
        this.notificationService.error(
          err.error?.error ?? 'Movie progress delete failed',
        );
      },
    });
  }

  onDeleteSeriesProgress(id: number) {
    this.seriesProgressService.deleteSeriesProgress(id).subscribe({
      next: (res: any) => {
        this.series = this.series.filter((s) => s.id !== id);
        this.notificationService.success(
          res.message ?? 'Series progress successfully deleted',
        );
      },
      error: (err) => {
        if (!shouldHandleError(err)) return;
        this.notificationService.error(
          err.error?.error ?? 'Series progress delete failed',
        );
      },
    });
  }
}
