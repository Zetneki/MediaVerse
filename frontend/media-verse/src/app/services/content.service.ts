import { Injectable } from '@angular/core';
import { MovieService } from './movie.service';
import { SeriesService } from './series.service';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Movie } from '../models/movie';
import { Series } from '../models/series';
import { MovieDetails } from '../models/moviedetails';
import { SeriesDetails } from '../models/seriesdetails';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor(
    private movieService: MovieService,
    private seriesService: SeriesService
  ) {}

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

  getPopularMovies$(
    page: number = 1
  ): Observable<{ results: Movie[]; total: number }> {
    return this.movieService.getPopularMovies(page).pipe(
      map((data) => ({
        results: data.results.map(this.mapMovie),
        total: data.total_results,
      }))
    );
  }

  getTopRatedMovies$(
    page: number = 1
  ): Observable<{ results: Movie[]; total: number }> {
    return this.movieService.getTopRatedMovies(page).pipe(
      map((data) => ({
        results: data.results.map(this.mapMovie),
        total: data.total_results,
      }))
    );
  }

  getPopularSeries$(
    page: number = 1
  ): Observable<{ results: Series[]; total: number }> {
    return this.seriesService.getPopularSeries(page).pipe(
      map((data) => ({
        results: data.results.map(this.mapSeries),
        total: data.total_results,
      }))
    );
  }

  getTopRatedSeries$(
    page: number = 1
  ): Observable<{ results: Series[]; total: number }> {
    return this.seriesService.getTopRatedSeries(page).pipe(
      map((data) => ({
        results: data.results.map(this.mapSeries),
        total: data.total_results,
      }))
    );
  }

  searchContent$(query: string) {
    if (!query || query.length < 2) {
      return of({ movies: [], series: [], totalMovies: 0, totalSeries: 0 });
    }

    return forkJoin({
      moviesData: this.movieService.searchMovies(query),
      seriesData: this.seriesService.searchSeries(query),
    }).pipe(
      map(({ moviesData, seriesData }) => ({
        movies: moviesData.results.map(this.mapMovie),
        series: seriesData.results.map(this.mapSeries),
        totalMovies: moviesData.total_results,
        totalSeries: seriesData.total_results,
      }))
    );
  }

  searchContentPage$<T extends Movie | Series>(
    type: 'movies' | 'series',
    query: string,
    page: number = 1
  ) {
    if (!query || query.length < 2) {
      return of([]);
    }

    switch (type) {
      case 'movies':
        return this.movieService
          .searchMovies(query, page)
          .pipe(map((data) => data.results.map(this.mapMovie) as T[]));
      case 'series':
        return this.seriesService
          .searchSeries(query, page)
          .pipe(map((data) => data.results.map(this.mapSeries) as T[]));
    }
  }

  filterContent$<T extends Movie | Series>(
    type: 'movies' | 'series',
    filter: { genres: number[]; sortBy: string },
    page: number = 1
  ): Observable<{ results: T[]; total: number }> {
    const { genres, sortBy } = filter;

    switch (type) {
      case 'movies':
        return this.movieService.filterMovies(genres, sortBy, page).pipe(
          map((data) => ({
            results: data.results.map(this.mapMovie) as T[],
            total: data.total_results,
          }))
        );

      case 'series':
        return this.seriesService.filterSeries(genres, sortBy, page).pipe(
          map((data) => ({
            results: data.results.map(this.mapSeries) as T[],
            total: data.total_results,
          }))
        );
    }
  }

  getMovie$(id: number): Observable<MovieDetails> {
    return this.movieService.getMovie(id).pipe(
      map((data) => ({
        ...data,
        poster_path: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : '/assets/tmdb_no_img.png',
        backdrops: data.backdrops.map((backdrop) =>
          backdrop
            ? `https://image.tmdb.org/t/p/original${backdrop}`
            : '/assets/tmdb_no_img.png'
        ),
        similar_movies: data.similar_movies?.map((movie) => ({
          ...movie,
          poster_path: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/assets/tmdb_no_img.png',
        })),
      }))
    );
  }

  getSeries$(id: number): Observable<SeriesDetails> {
    return this.seriesService.getSeries(id).pipe(
      map((data) => ({
        ...data,
        poster_path: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : '/assets/tmdb_no_img.png',
        backdrops: data.backdrops.map((backdrop) =>
          backdrop
            ? `https://image.tmdb.org/t/p/original${backdrop}`
            : '/assets/tmdb_no_img.png'
        ),
        seasons: data.seasons.map((season) => ({
          ...season,
          poster_path: season.poster_path
            ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
            : '/assets/tmdb_no_img.png',
        })),
        similar_series: data.similar_series?.map((series) => ({
          ...series,
          poster_path: series.poster_path
            ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
            : '/assets/tmdb_no_img.png',
        })),
      }))
    );
  }

  getMovieGenres$() {
    return this.movieService.getMovieGenres().pipe(map((genres) => genres));
  }

  getSeriesGenres$() {
    return this.seriesService.getSeriesGenres().pipe(map((genres) => genres));
  }
}
