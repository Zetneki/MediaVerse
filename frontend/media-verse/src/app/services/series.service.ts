import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SeriesResponse } from '../models/seriesresponse';
import { Genre } from '../models/genre';
import { SeriesDetails } from '../models/seriesdetails';

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  readonly baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPopularSeries(page: number = 1): Observable<SeriesResponse> {
    const params = new HttpParams().set('page', page.toString());

    return this.http.get<SeriesResponse>(`${this.baseUrl}/api/series/popular`, {
      params,
    });
  }

  getTopRatedSeries(page: number = 1): Observable<SeriesResponse> {
    const params = new HttpParams().set('page', page.toString());

    return this.http.get<SeriesResponse>(
      `${this.baseUrl}/api/series/toprated`,
      { params }
    );
  }

  searchSeries(query: string, page: number = 1): Observable<SeriesResponse> {
    let params = new HttpParams().set('query', query);

    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<SeriesResponse>(`${this.baseUrl}/api/series/search`, {
      params,
    });
  }

  filterSeries(
    genreIds: number[] = [],
    sortBy: string = '',
    page: number = 1
  ): Observable<SeriesResponse> {
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

    return this.http.get<SeriesResponse>(`${this.baseUrl}/api/series/filter`, {
      params,
    });
  }

  getSeries(id: number): Observable<SeriesDetails> {
    return this.http.get<SeriesDetails>(
      `${this.baseUrl}/api/series/details/${id}`
    );
  }

  getSeriesGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.baseUrl}/api/genres/series`);
  }
}
