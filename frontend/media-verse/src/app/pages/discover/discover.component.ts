import { Component, effect, inject, OnInit, signal } from '@angular/core';
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
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Genre } from '../../models/genre';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { FilterComponent } from '../../components/filter/filter.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

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
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.scss',
})
export class DiscoverComponent implements OnInit {
  movieService = inject(MovieService);
  seriesService = inject(SeriesService);

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

  selectedTypeSignal = signal<SelectOption>({
    label: 'Movies',
    value: 'movies',
  });

  activeTab = signal<number>(0);
  tabs: string[] = ['Popular', 'Top Rated', 'Search', 'Filter'];
  tabsValues: string[] = ['popular', 'top_rated', 'search', 'filter'];

  searchControl = new FormControl('');

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

  ngOnInit() {
    this.getPopular();

    this.getTopRated();

    this.searchContent();

    this.movieService.getMovieGenres().subscribe((data) => {
      this.movieGenres = data;
    });

    this.seriesService.getSeriesGenres().subscribe((data) => {
      this.seriesGenres = data;
    });
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
  }

  setActiveTab(index: number) {
    this.activeTab.set(index);
    this.first = 0;
  }

  private mapMovie(movie: Movie): Movie {
    return {
      ...movie,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/assets/tmdb_no_img.png',
    };
  }

  private mapSeries(series: Series): Series {
    return {
      ...series,
      poster_path: series.poster_path
        ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
        : '/assets/tmdb_no_img.png',
    };
  }

  getPopular(page: number = 1) {
    switch (this.selectedTypeSignal().value) {
      case 'movies':
        this.movieService.getPopularMovies(page).subscribe((data) => {
          this.popularMovies = data.results.map((movie) =>
            this.mapMovie(movie)
          );
          this.totalRecordsMap['movies']['popular'] = data.total_results;
        });
        break;
      case 'series':
        this.seriesService.getPopularSeries(page).subscribe((data) => {
          this.popularSeries = data.results.map((series) =>
            this.mapSeries(series)
          );
          this.totalRecordsMap['series']['popular'] = data.total_results;
        });
        break;
    }
  }

  getTopRated(page: number = 1) {
    switch (this.selectedTypeSignal().value) {
      case 'movies':
        this.movieService.getTopRatedMovies(page).subscribe((data) => {
          this.topRatedMovies = data.results.map((movie) =>
            this.mapMovie(movie)
          );
          this.totalRecordsMap['movies']['top_rated'] = data.total_results;
        });
        break;
      case 'series':
        this.seriesService.getTopRatedSeries(page).subscribe((data) => {
          this.topRatedSeries = data.results.map((series) =>
            this.mapSeries(series)
          );
          this.totalRecordsMap['series']['top_rated'] = data.total_results;
        });
        break;
    }
  }

  searchContent() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            return of({
              movies: { results: [], total_results: 0 },
              series: { results: [], total_results: 0 },
            });
          }

          return forkJoin({
            movies: this.movieService.searchMovies(query),
            series: this.seriesService.searchSeries(query),
          });
        })
      )
      .subscribe((data) => {
        this.searchMovies = data.movies.results.map((movie) =>
          this.mapMovie(movie)
        );
        this.searchSeries = data.series.results.map((series) =>
          this.mapSeries(series)
        );
        this.totalRecordsMap['movies']['search'] = data.movies.total_results;
        this.totalRecordsMap['series']['search'] = data.series.total_results;
      });
  }

  searchContentPage(page: number = 1) {
    switch (this.selectedTypeSignal().value) {
      case 'movies':
        this.movieService
          .searchMovies(this.searchControl.value ?? '', page)
          .subscribe((data) => {
            this.searchMovies = data.results.map((movie) =>
              this.mapMovie(movie)
            );
          });
        break;
      case 'series':
        this.seriesService
          .searchSeries(this.searchControl.value ?? '', page)
          .subscribe((data) => {
            this.searchSeries = data.results.map((series) =>
              this.mapSeries(series)
            );
          });
        break;
    }
  }

  onApplyFilters(
    event: { genres: number[]; sortBy: string },
    page: number = 1
  ) {
    this.lastFilter = event;

    const { genres, sortBy } = event;

    switch (this.selectedTypeSignal().value) {
      case 'movies':
        this.movieService
          .filterMovies(genres, sortBy, page)
          .subscribe((data) => {
            this.filterMovies = data.results.map((movie) =>
              this.mapMovie(movie)
            );
            this.totalRecordsMap['movies']['filter'] = data.total_results;
          });
        break;
      case 'series':
        this.seriesService
          .filterSeries(genres, sortBy, page)
          .subscribe((data) => {
            this.filterSeries = data.results.map((series) =>
              this.mapSeries(series)
            );
            this.totalRecordsMap['series']['filter'] = data.total_results;
          });
        break;
    }
  }
}
