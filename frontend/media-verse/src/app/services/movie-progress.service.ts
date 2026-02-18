import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieStatus } from '../utils/movie-status.type';
import { MovieProgress } from '../models/movieprogress';

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

  getMoviesProgress() {
    return this.http.get<MovieProgress[]>(`${this.baseUrl}/movie-progress`);
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
