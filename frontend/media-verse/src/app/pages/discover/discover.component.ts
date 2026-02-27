import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Movie } from '../../models/movie';
import { Series } from '../../models/series';
import { MovieService } from '../../services/movie.service';
import { SeriesService } from '../../services/series.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { SelectOption } from '../../models/selectoption';
import { DiscoverDropdownComponent } from '../../components/discover-dropdown/discover-dropdown.component';
import { SeriesCardComponent } from '../../components/series-card/series-card.component';
import { FormControl, FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Genre } from '../../models/genre';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { FilterComponent } from '../../components/filter/filter.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { DiscoverListComponent } from '../../components/discover-list/discover-list.component';
import { ContentService } from '../../services/content.service';
import { RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-discover',
  imports: [
    MovieCardComponent,
    DiscoverDropdownComponent,
    SeriesCardComponent,
    ReactiveFormsModule,
    AccordionModule,
    SelectModule,
    FormsModule,
    FilterComponent,
    PaginatorModule,
    SkeletonCardComponent,
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.scss',
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
export class DiscoverComponent implements OnInit, OnDestroy {
  skeletonArray = Array(20);

  contentService = inject(ContentService);

  popularMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  searchMovies: Movie[] = [];
  filterMovies: Movie[] = [];
  movieGenres: Genre[] = [];

  popularSeries: Series[] = [];
  topRatedSeries: Series[] = [];
  searchSeries: Series[] = [];
  filterSeries: Series[] = [];
  seriesGenres: Genre[] = [];

  selectedTypeSignal = signal<SelectOption<'movies' | 'series'>>({
    label: 'Movies',
    value: 'movies',
  });

  activeTab = signal<number>(0);
  tabs: string[] = ['Popular', 'Top Rated', 'Search', 'Filter'];
  tabsValues: string[] = ['popular', 'top_rated', 'search', 'filter'];

  isSearching = signal(false);
  searchControl = new FormControl('');

  isFiltering = signal(false);
  lastFilter: { genres: number[]; sortBy: string } = {
    genres: [],
    sortBy: 'popularity.desc',
  };

  first: number = 0;
  rows: number = 20;
  totalRecordsMap: Record<string, Record<string, number>> = {
    movies: {
      popular: 0,
      top_rated: 0,
      search: 0,
      filter: 0,
    },
    series: {
      popular: 0,
      top_rated: 0,
      search: 0,
      filter: 0,
    },
  };

  constructor() {
    const saved = localStorage.getItem('discover-selected-type');
    if (saved) {
      this.selectedTypeSignal.set(JSON.parse(saved));
    }

    effect(() => {
      const value = this.selectedTypeSignal();
      localStorage.setItem('discover-selected-type', JSON.stringify(value));
    });

    effect(() => {
      this.getPopular();
      this.getTopRated();
    });
  }

  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.searchContent$.subscribe((data) => {
        this.searchMovies = data.movies;
        this.searchSeries = data.series;

        this.totalRecordsMap['movies']['search'] = data.totalMovies;
        this.totalRecordsMap['series']['search'] = data.totalSeries;
      }),
    );
    this.subscriptions.add(
      this.contentService.getMovieGenres$().subscribe((genres) => {
        this.movieGenres = genres;
      }),
    );

    this.subscriptions.add(
      this.contentService.getSeriesGenres$().subscribe((genres) => {
        this.seriesGenres = genres;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get totalRecords(): number {
    const type = this.selectedTypeSignal().value;
    const tabKey = this.tabsValues[this.activeTab()];
    const totalRecords = this.totalRecordsMap[type][tabKey];
    return totalRecords <= 2000 ? totalRecords : 2000;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 20;
    const page = (event.page ?? 0) + 1;

    const tab = this.tabs[this.activeTab()];

    switch (tab) {
      case 'Popular':
        this.getPopular(page);
        break;
      case 'Top Rated':
        this.getTopRated(page);
        break;
      case 'Search':
        this.searchContentPage(page);
        break;
      case 'Filter':
        this.onApplyFilters(this.lastFilter, page);
        break;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  setActiveTab(index: number) {
    this.activeTab.set(index);
    this.first = 0;

    const page = 1;
    const tab = this.tabs[index];

    switch (tab) {
      case 'Popular':
        this.getPopular(page);
        break;
      case 'Top Rated':
        this.getTopRated(page);
        break;
      case 'Search':
        this.searchContentPage(page);
        break;
      case 'Filter':
        this.onApplyFilters(this.lastFilter, page);
        break;
    }
  }

  getPopular(page: number = 1) {
    const type = this.selectedTypeSignal().value;
    switch (type) {
      case 'movies':
        this.contentService.getPopularMovies$(page).subscribe((data) => {
          this.popularMovies = data.results;
          this.totalRecordsMap['movies']['popular'] = data.total;
        });
        break;
      case 'series':
        this.contentService.getPopularSeries$(page).subscribe((data) => {
          this.popularSeries = data.results;
          this.totalRecordsMap['series']['popular'] = data.total;
        });
        break;
    }
  }

  getTopRated(page: number = 1) {
    const type = this.selectedTypeSignal().value;
    switch (type) {
      case 'movies':
        this.contentService.getTopRatedMovies$(page).subscribe((data) => {
          this.topRatedMovies = data.results;
          this.totalRecordsMap['movies']['top_rated'] = data.total;
        });
        break;
      case 'series':
        this.contentService.getTopRatedSeries$(page).subscribe((data) => {
          this.topRatedSeries = data.results;
          this.totalRecordsMap['series']['top_rated'] = data.total;
        });
        break;
    }
  }

  searchContent$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => (this.first = 0)),
    switchMap((query) => {
      if (!query || query.length < 2) {
        return of({ movies: [], series: [], totalMovies: 0, totalSeries: 0 });
      }
      this.isSearching.set(true);
      return this.contentService
        .searchContent$(query)
        .pipe(finalize(() => this.isSearching.set(false)));
    }),
  );

  searchContentPage(page: number = 1) {
    const type = this.selectedTypeSignal().value;
    const query = this.searchControl.value ?? '';

    this.isSearching.set(true);

    this.contentService
      .searchContentPage$(type, query, page)
      .pipe(finalize(() => this.isSearching.set(false)))
      .subscribe((results) => {
        switch (type) {
          case 'movies':
            this.searchMovies = results as Movie[];
            break;
          case 'series':
            this.searchSeries = results as Series[];
            break;
        }
      });
  }

  onApplyFilters(
    filter: { genres: number[]; sortBy: string },
    page: number = 1,
  ) {
    this.lastFilter = filter;
    this.isFiltering.set(true);

    const type = this.selectedTypeSignal().value;

    this.contentService
      .filterContent$(type, filter, page)
      .pipe(finalize(() => this.isFiltering.set(false)))
      .subscribe(({ results, total }) => {
        if (type === 'movies') {
          this.filterMovies = results as Movie[];
          this.totalRecordsMap['movies']['filter'] = total;
        } else {
          this.filterSeries = results as Series[];
          this.totalRecordsMap['series']['filter'] = total;
        }
      });
  }

  // get currentType() {
  //   return this.selectedTypeSignal().value;
  // }

  // get currentGenres(): Genre[] {
  //   switch (this.currentType) {
  //     case 'movies':
  //       return this.movieGenres;
  //     case 'series':
  //       return this.seriesGenres;

  //     default:
  //       return [];
  //   }
  // }

  // get currentItems(): any[] {
  //   const tabKey = this.tabsValues[this.activeTab()];
  //   switch (this.currentType) {
  //     case 'movies':
  //       return this.getItemsByTab(
  //         this.popularMovies,
  //         this.topRatedMovies,
  //         this.searchMovies,
  //         this.filterMovies,
  //         tabKey
  //       );
  //     case 'series':
  //       return this.getItemsByTab(
  //         this.popularSeries,
  //         this.topRatedSeries,
  //         this.searchSeries,
  //         this.filterSeries,
  //         tabKey
  //       );
  //     default:
  //       return [];
  //   }
  // }

  // private getItemsByTab(
  //   popular: any[],
  //   topRated: any[],
  //   search: any[],
  //   filter: any[],
  //   tabKey: string
  // ): any[] {
  //   switch (tabKey) {
  //     case 'popular':
  //       return popular;
  //     case 'top_rated':
  //       return topRated;
  //     case 'search':
  //       return search;
  //     case 'filter':
  //       return filter;
  //     default:
  //       return [];
  //   }
  // }

  // get currentIsLoading(): boolean {
  //   const tabKey = this.tabsValues[this.activeTab()];
  //   switch (tabKey) {
  //     case 'popular':
  //     case 'top_rated':
  //       return this.currentItems.length === 0;
  //     case 'search':
  //       return this.isSearching();
  //     case 'filter':
  //       return this.isFiltering();
  //     default:
  //       return false;
  //   }
  // }
}
