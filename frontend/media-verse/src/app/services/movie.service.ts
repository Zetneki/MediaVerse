import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoviesResponse } from '../models/moviesrepsonse';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<MoviesResponse> {
    try {
      return this.http.get<MoviesResponse>(
        `${this.baseUrl}/api/movies/popular`
      );
    } catch (error) {
      throw 'Could not connect to server';
    }
  }
}
