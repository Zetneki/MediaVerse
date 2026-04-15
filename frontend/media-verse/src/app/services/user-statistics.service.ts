import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';
import { StatusStat } from '../models/statusstat';
import { GenreStats } from '../models/genresstats';

@Injectable({
  providedIn: 'root',
})
export class UserStatisticsService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getMovieStatusStatsByUserId(): Promise<StatusStat[]> {
    return firstValueFrom(
      this.http.get<StatusStat[]>(
        `${this.baseUrl}/user-statistics/movie-status`,
      ),
    );
  }

  getSeriesStatusStatsByUserId(): Promise<StatusStat[]> {
    return firstValueFrom(
      this.http.get<StatusStat[]>(
        `${this.baseUrl}/user-statistics/series-status`,
      ),
    );
  }

  getMovieTopGenresByUserId(): Promise<GenreStats[]> {
    return firstValueFrom(
      this.http.get<GenreStats[]>(
        `${this.baseUrl}/user-statistics/movie-genres`,
      ),
    );
  }

  getSeriesTopGenresByUserId(): Promise<GenreStats[]> {
    return firstValueFrom(
      this.http.get<GenreStats[]>(
        `${this.baseUrl}/user-statistics/series-genres`,
      ),
    );
  }
}
