import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoviesResponse } from '../models/moviesresponse';
import { Genre } from '../models/genre';
import { MovieDetails } from '../models/moviedetails';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<MoviesResponse> {
    const params = new HttpParams().set('page', page.toString());

    return this.http.get<MoviesResponse>(`${this.baseUrl}/api/movies/popular`, {
      params,
    });
  }

  getTopRatedMovies(page: number = 1): Observable<MoviesResponse> {
    const params = new HttpParams().set('page', page.toString());

    return this.http.get<MoviesResponse>(
      `${this.baseUrl}/api/movies/toprated`,
      { params }
    );
  }

  searchMovies(query: string, page: number = 1): Observable<MoviesResponse> {
    let params = new HttpParams().set('query', query);

    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<MoviesResponse>(`${this.baseUrl}/api/movies/search`, {
      params,
    });
  }

  filterMovies(
    genreIds: number[] = [],
    sortBy: string = '',
    page: number = 1
  ): Observable<MoviesResponse> {
    let params = new HttpParams();

    if (genreIds.length > 0) {
      params = params.set('genreIds', genreIds.join(','));
    }

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<MoviesResponse>(`${this.baseUrl}/api/movies/filter`, {
      params,
    });
  }

  getMovie(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(
      `${this.baseUrl}/api/movies/details/${id}`
    );
  }

  getMovieGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.baseUrl}/api/genres/movies`);
  }
}
