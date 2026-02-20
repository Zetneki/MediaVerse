import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MovieProgressService } from '../../services/movie-progress.service';
import { SeriesProgressService } from '../../services/series-progress.service';
import { MovieProgress } from '../../models/movieprogress';
import { AuthService } from '../../services/auth.service';
import { DiscoverDropdownComponent } from '../../components/discover-dropdown/discover-dropdown.component';
import { SelectOption } from '../../models/selectoption';
import { SeriesProgress } from '../../models/seriesprogress';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddMovieToLibraryComponent } from '../../components/add-movie-to-library/add-movie-to-library.component';
import { MovieStatus } from '../../utils/movie-status.type';
import { AddSeriesToLibraryComponent } from '../../components/add-series-to-library/add-series-to-library.component';
import { SeriesStatus } from '../../utils/series-status.type';
import { ChipModule } from 'primeng/chip';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SeasonDetails } from '../../models/seasondetails';

@Component({
  selector: 'app-library',
  imports: [
    DiscoverDropdownComponent,
    AddMovieToLibraryComponent,
    AddSeriesToLibraryComponent,
    ChipModule,
    RouterModule,
    DatePipe,
    ButtonModule,
    ProgressBarModule,
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
  filterMovieStatus = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Plan to watch',
      value: 'plan_to_watch',
    },
    {
      label: 'Completed',
      value: 'completed',
    },
  ];

  series: SeriesProgress[] = [];
  editDialogVisibleSeries = false;
  selectedSeries: SeriesProgress | null = null;
  filterSeriesStatus = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Plan to watch',
      value: 'plan_to_watch',
    },
    {
      label: 'Watching',
      value: 'watching',
    },
    {
      label: 'Completed',
      value: 'completed',
    },
  ];

  selectedTypeSignal = signal<SelectOption<'movies' | 'series'>>({
    label: 'Movies',
    value: 'movies',
  });

  selectedStatus: string = 'all';

  isLargeScreen = signal<boolean>(window.innerWidth > 1024);

  constructor(
    private movieProgressService: MovieProgressService,
    private seriesProgressService: SeriesProgressService,
    private router: Router,
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
        this.movies = res.map((m) => ({
          ...m,
          poster_path: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : '/assets/tmdb_no_img.png',
        }));
      });
    this.seriesProgressService
      .getSeriesProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.series = res.map((s) => ({
          ...s,
          poster_path: s.poster_path
            ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
            : '/assets/tmdb_no_img.png',
          seasons: s.seasons.sort((a, b) => {
            if (a.season_number === 0) return 1;
            if (b.season_number === 0) return -1;
            return a.season_number - b.season_number;
          }),
        }));
      });

    this.setupResizeListener();
  }

  totalEpisodesWithoutSpecials(
    seasons: SeasonDetails[],
    total_episodes: number,
  ) {
    const val = seasons.find((s) => s.season_number === 0)?.episode_count;
    return total_episodes - (val ?? 0);
  }

  episodesWatched(
    seasons: SeasonDetails[],
    current_season: number,
    current_episode: number,
  ) {
    let episodesWatched = 0;

    if (!seasons || !current_season || !current_episode) return 0;

    for (const season of seasons) {
      if (season.season_number === current_season) {
        episodesWatched += current_episode;
        break;
      }
      episodesWatched += season.episode_count;
    }
    return episodesWatched;
  }

  private setupResizeListener() {
    const handleResize = () => {
      this.isLargeScreen.set(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);

    effect(() => {
      return () => window.removeEventListener('resize', handleResize);
    });
  }

  navigateToMovie(id: number) {
    this.router.navigate(['/discover/movie', id]);
  }

  navigateToSeries(id: number) {
    this.router.navigate(['/discover/series', id]);
  }

  getMovieStatusLabel(status: string): string {
    return this.filterMovieStatus.find((s) => s.value === status)?.label ?? '';
  }

  getSeriesStatusLabel(status: string): string {
    return this.filterSeriesStatus.find((s) => s.value === status)?.label ?? '';
  }

  toggleStatus(value: string) {
    if (this.selectedStatus !== value) {
      this.selectedStatus = value;
    }
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
}
