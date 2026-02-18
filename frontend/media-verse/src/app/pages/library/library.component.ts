import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MovieProgressService } from '../../services/movie-progress.service';
import { SeriesProgressService } from '../../services/series-progress.service';
import { MovieProgress } from '../../models/movieprogress';
import { NotificationService } from '../../services/notification.service';
import { shouldHandleError } from '../../utils/error-handler';
import { AuthService } from '../../services/auth.service';
import { DiscoverDropdownComponent } from '../../components/discover-dropdown/discover-dropdown.component';
import { SelectOption } from '../../models/selectoption';
import { SeriesProgress } from '../../models/seriesprogress';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddMovieToLibraryComponent } from '../../components/add-movie-to-library/add-movie-to-library.component';
import { MovieStatus } from '../../utils/movie-status.type';
import { AddSeriesToLibraryComponent } from '../../components/add-series-to-library/add-series-to-library.component';
import { SeriesStatus } from '../../utils/series-status.type';

@Component({
  selector: 'app-library',
  imports: [
    DiscoverDropdownComponent,
    AddMovieToLibraryComponent,
    AddSeriesToLibraryComponent,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  private destroyRef = inject(DestroyRef);
  authService = inject(AuthService);

  movies: MovieProgress[] = [];
  editDialogVisibleMovie = false;
  selectedMovie: MovieProgress | null = null;

  series: SeriesProgress[] = [];
  editDialogVisibleSeries = false;
  selectedSeries: SeriesProgress | null = null;

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

    this.movieProgressService
      .getMoviesProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.movies = res;
      });
    this.seriesProgressService
      .getSeriesProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.series = res;
      });
  }

  editMovie(movie: MovieProgress) {
    this.selectedMovie = movie;
    this.editDialogVisibleMovie = true;
  }

  onMovieSaved(updatedMovie: { id: number; status: MovieStatus }) {
    const index = this.movies.findIndex((m) => m.id === updatedMovie.id);
    if (index !== -1) {
      this.movies[index] = {
        ...this.movies[index],
        status: updatedMovie.status,
        last_watched: new Date().toISOString(),
      };

      this.movies.sort(
        (a, b) =>
          new Date(b.last_watched!).getTime() -
          new Date(a.last_watched!).getTime(),
      );
    }
  }

  onMovieDeleted(movieId: number) {
    this.movies = this.movies.filter((m) => m.id !== movieId);
  }

  editSeries(series: SeriesProgress) {
    this.selectedSeries = series;
    this.editDialogVisibleSeries = true;
  }

  onSeriesSaved(updatedSeries: {
    id: number;
    status: SeriesStatus;
    current_season: number;
    current_episode: number;
  }) {
    const index = this.series.findIndex((s) => s.id === updatedSeries.id);
    if (index !== -1) {
      this.series[index] = {
        ...this.series[index],
        status: updatedSeries.status,
        current_season: updatedSeries.current_season,
        current_episode: updatedSeries.current_episode,
        last_watched: new Date().toISOString(),
      };

      this.series.sort(
        (a, b) =>
          new Date(b.last_watched!).getTime() -
          new Date(a.last_watched!).getTime(),
      );
    }
  }

  onSeriesDeleted(seriesId: number) {
    this.series = this.series.filter((s) => s.id !== seriesId);
  }

  // onDeleteSeriesProgress(id: number) {
  //   this.seriesProgressService
  //     .deleteSeriesProgress(id)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe({
  //       next: (res: any) => {
  //         this.series = this.series.filter((s) => s.id !== id);
  //         this.notificationService.success(
  //           res.message ?? 'Series progress successfully deleted',
  //         );
  //       },
  //       error: (err) => {
  //         if (!shouldHandleError(err)) return;
  //         this.notificationService.error(
  //           err.error?.error ?? 'Series progress delete failed',
  //         );
  //       },
  //     });
  // }
}
