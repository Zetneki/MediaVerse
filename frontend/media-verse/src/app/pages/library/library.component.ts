import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { PlusEpisodeButtonComponent } from '../../components/plus-episode-button/plus-episode-button.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { animate, style, transition, trigger } from '@angular/animations';

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
    SelectModule,
    FormsModule,
    FloatLabelModule,
    PaginatorModule,
    PlusEpisodeButtonComponent,
    SkeletonCardComponent,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '600ms 50ms ease',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class LibraryComponent {
  private destroyRef = inject(DestroyRef);
  authService = inject(AuthService);
  private isFirstLoad = true;

  skeletonArray = Array(20);

  //movies
  movies: MovieProgress[] = [];
  editDialogVisibleMovie = false;
  selectedMovie: MovieProgress | null = null;

  //series
  series: SeriesProgress[] = [];
  editDialogVisibleSeries = false;
  selectedSeries: SeriesProgress | null = null;

  //pagination
  first = 0;
  itemsPerPage = 20;
  totalItems = 0;

  //filters & sort
  selectedStatus = signal<string>('all');
  searchTerm = '';
  selectedSortBy = signal<string>('last_watched');
  selectedSortOrder = signal<'asc' | 'desc'>('desc');

  sortOrderIcon = 'pi pi-angle-down';

  isLoading = false;

  private searchSubject = new Subject<string>();
  private loadTrigger = new Subject<void>();

  filterMovieStatus = [
    { label: 'All', value: 'all' },
    { label: 'Plan to watch', value: 'plan_to_watch' },
    { label: 'Completed', value: 'completed' },
  ];

  filterSeriesStatus = [
    { label: 'All', value: 'all' },
    { label: 'Plan to watch', value: 'plan_to_watch' },
    { label: 'Watching', value: 'watching' },
    { label: 'Completed', value: 'completed' },
  ];

  sortOptionsMovies = [
    { label: 'Watch date', value: 'last_watched' },
    { label: 'Title', value: 'title' },
    { label: 'Status', value: 'status' },
  ];

  sortOptionsMoviesComputed = computed(() => {
    const status = this.selectedStatus();
    return this.sortOptionsMovies.map((opt) => ({
      ...opt,
      disabled: opt.value === 'status' && status !== 'all',
    }));
  });

  sortOptionsSeries = [
    { label: 'Watch date', value: 'last_watched' },
    { label: 'Title', value: 'name' },
    { label: 'Status', value: 'status' },
  ];

  sortOptionsSeriesComputed = computed(() => {
    const status = this.selectedStatus();
    return this.sortOptionsSeries.map((opt) => ({
      ...opt,
      disabled: opt.value === 'status' && status !== 'all',
    }));
  });

  isSelectOpen: boolean = false;

  selectedTypeSignal = signal<SelectOption<'movies' | 'series'>>({
    label: 'Movies',
    value: 'movies',
  });

  isLargeScreen = signal<boolean>(window.innerWidth > 1024);
  isSmallScreen = signal<boolean>(window.innerWidth < 501);

  constructor(
    private movieProgressService: MovieProgressService,
    private seriesProgressService: SeriesProgressService,
    private router: Router,
  ) {
    const saved = localStorage.getItem('library-selected-type');
    if (saved) {
      this.selectedTypeSignal.set(JSON.parse(saved));
    }

    this.loadFiltersFromStorage();

    effect(() => {
      const typeOption = this.selectedTypeSignal();
      localStorage.setItem('library-selected-type', JSON.stringify(typeOption));
    });

    effect(() => {
      const type = this.selectedTypeSignal().value;

      if (!this.isFirstLoad) {
        this.loadFiltersFromStorage();
        this.searchTerm = '';
        this.first = 0;
        this.triggerLoad();
      }

      this.isFirstLoad = false;
    });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.first = 0;
        this.triggerLoad();
      });

    this.loadTrigger
      .pipe(
        debounceTime(200),
        switchMap(() => {
          this.isLoading = true;

          if (this.selectedTypeSignal().value === 'movies') {
            return this.movieProgressService
              .getMoviesProgress(this.page, this.itemsPerPage, {
                status: this.selectedStatus(),
                search: this.searchTerm,
                sortBy: this.selectedSortBy(),
                sortOrder: this.selectedSortOrder(),
              })
              .pipe(catchError(() => of({ items: [], total: 0 })));
          } else {
            return this.seriesProgressService
              .getSeriesProgress(this.page, this.itemsPerPage, {
                status: this.selectedStatus(),
                search: this.searchTerm,
                sortBy: this.selectedSortBy(),
                sortOrder: this.selectedSortOrder(),
              })
              .pipe(catchError(() => of({ items: [], total: 0 })));
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (this.selectedTypeSignal().value === 'movies') {
          this.movies = res.items.map((m: any) => ({
            ...m,
            poster_path: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : '/assets/tmdb_no_img.png',
          }));
        } else {
          this.series = res.items.map((s: any) => ({
            ...s,
            poster_path: s.poster_path
              ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
              : '/assets/tmdb_no_img.png',
            seasons: s.seasons.sort((a: any, b: any) => {
              if (a.season_number === 0) return 1;
              if (b.season_number === 0) return -1;
              return a.season_number - b.season_number;
            }),
          }));
        }

        this.totalItems = res.total;
        this.isLoading = false;
      });

    this.triggerLoad();
    this.setupResizeListener();
  }

  private loadFiltersFromStorage() {
    const type = this.selectedTypeSignal().value;
    const saved = localStorage.getItem(`library-filters-${type}`);

    if (!saved) return;

    const parsed = JSON.parse(saved);

    this.selectedStatus.set(parsed.status ?? 'all');
    this.selectedSortBy.set(parsed.sortBy ?? 'last_watched');
    this.selectedSortOrder.set(parsed.sortOrder ?? 'desc');

    this.sortOrderIcon =
      this.selectedSortOrder() === 'asc'
        ? 'pi pi-angle-up'
        : 'pi pi-angle-down';
  }

  private saveFilters() {
    const type = this.selectedTypeSignal().value;
    const filters = {
      status: this.selectedStatus(),
      sortBy: this.selectedSortBy(),
      sortOrder: this.selectedSortOrder(),
    };
    localStorage.setItem(`library-filters-${type}`, JSON.stringify(filters));
  }

  private triggerLoad() {
    this.loadTrigger.next();
  }

  get buttonSize() {
    if (this.isLargeScreen()) return 'large';
    return this.isSmallScreen() ? 'small' : undefined;
  }

  toggleStatus(value: string) {
    if (this.selectedStatus() !== value) {
      this.selectedStatus.set(value);
      if (this.selectedSortBy() === 'status')
        this.selectedSortBy.set('last_watched');
      this.saveFilters();
      this.first = 0;
      this.triggerLoad();
    }
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onSortByChange() {
    this.saveFilters();
    this.first = 0;
    this.triggerLoad();
  }

  private get page(): number {
    return Math.floor(this.first / this.itemsPerPage) + 1;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.itemsPerPage = event.rows ?? 20;

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.triggerLoad();
  }

  onSortOrder() {
    this.selectedSortOrder.set(
      this.selectedSortOrder() === 'asc' ? 'desc' : 'asc',
    );
    this.sortOrderIcon =
      this.selectedSortOrder() === 'asc'
        ? 'pi pi-angle-up'
        : 'pi pi-angle-down';
    this.saveFilters();
    this.first = 0;
    this.triggerLoad();
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
      this.isSmallScreen.set(window.innerWidth < 501);
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

  editMovie(movie: MovieProgress) {
    this.selectedMovie = movie;
    this.editDialogVisibleMovie = true;
  }

  onMovieSaved(updatedMovie: {
    id: number;
    status: MovieStatus;
    last_watched: string;
  }) {
    const index = this.movies.findIndex((m) => m.id === updatedMovie.id);
    if (index !== -1) {
      this.movies[index] = {
        ...this.movies[index],
        status: updatedMovie.status,
        last_watched: updatedMovie.last_watched,
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
    last_watched: string;
  }) {
    const index = this.series.findIndex((s) => s.id === updatedSeries.id);
    if (index !== -1) {
      this.series[index] = {
        ...this.series[index],
        status: updatedSeries.status,
        current_season: updatedSeries.current_season,
        current_episode: updatedSeries.current_episode,
        last_watched: updatedSeries.last_watched,
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
