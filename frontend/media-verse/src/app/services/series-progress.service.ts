import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SeriesStatus } from '../utils/series-status.type';
import { SeriesProgress } from '../models/seriesprogress';

@Injectable({
  providedIn: 'root',
})
export class SeriesProgressService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProgressBySeriesId(id: number) {
    return this.http.get(`${this.baseUrl}/series-progress/details/${id}`);
  }

  getSeriesProgress() {
    return this.http.get<SeriesProgress[]>(`${this.baseUrl}/series-progress`);
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
