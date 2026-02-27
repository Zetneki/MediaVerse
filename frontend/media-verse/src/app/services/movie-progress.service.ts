import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieStatus } from '../utils/movie-status.type';
import { MovieProgress } from '../models/movieprogress';
import { MovieProgressResponse } from '../models/movieprogressresponse';
import { ProgressFilters } from '../models/progressfilters';

@Injectable({
  providedIn: 'root',
})
export class MovieProgressService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProgressByMovieId(id: number) {
    return this.http.get<MovieProgress>(
      `${this.baseUrl}/movie-progress/details/${id}`,
    );
  }

  getMoviesProgress(
    page: number = 1,
    limit: number = 20,
    filters: ProgressFilters,
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    if (filters.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<MovieProgressResponse>(
      `${this.baseUrl}/movie-progress`,
      {
        params,
      },
    );
  }

  setMovieProgress(movieId: number, status: MovieStatus) {
    return this.http.post(`${this.baseUrl}/movie-progress`, {
      movieId,
      status,
    });
  }

  deleteMovieProgress(id: number) {
    return this.http.delete(`${this.baseUrl}/movie-progress/${id}`);
  }
}
