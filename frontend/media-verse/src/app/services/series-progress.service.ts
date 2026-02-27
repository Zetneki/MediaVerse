import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SeriesStatus } from '../utils/series-status.type';
import { SeriesProgress } from '../models/seriesprogress';
import { SeriesProgressResponse } from '../models/seriesprogressresponse';
import { ProgressFilters } from '../models/progressfilters';

@Injectable({
  providedIn: 'root',
})
export class SeriesProgressService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProgressBySeriesId(id: number) {
    return this.http.get<SeriesProgress>(
      `${this.baseUrl}/series-progress/details/${id}`,
    );
  }

  getSeriesProgress(
    page: number = 1,
    limit: number = 20,
    filters: ProgressFilters = {},
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

    return this.http.get<SeriesProgressResponse>(
      `${this.baseUrl}/series-progress`,
      {
        params,
      },
    );
  }

  setSeriesProgress(
    seriesId: number,
    status: SeriesStatus,
    season: number,
    episode: number,
  ) {
    return this.http.post(`${this.baseUrl}/series-progress`, {
      seriesId,
      status,
      season,
      episode,
    });
  }

  deleteSeriesProgress(id: number) {
    return this.http.delete(`${this.baseUrl}/series-progress/${id}`);
  }
}
