import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PopularMoviesResponse } from '../models/popularmoviesrepsonse';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<PopularMoviesResponse> {
    try {
      return this.http.get<PopularMoviesResponse>(
        `${this.baseUrl}/popularmovies`
      );
    } catch (error) {
      throw 'Could not connect to server';
    }
  }
}
