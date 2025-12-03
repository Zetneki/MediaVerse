import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SeriesResponse } from '../models/seriesresponse';

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  readonly baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPopularSeries(): Observable<SeriesResponse> {
    try {
      return this.http.get<SeriesResponse>(
        `${this.baseUrl}/api/series/popular`
      );
    } catch (error) {
      throw 'Could not connect to server';
    }
  }

  getTopRatedSeries(): Observable<SeriesResponse> {
    try {
      return this.http.get<SeriesResponse>(
        `${this.baseUrl}/api/series/toprated`
      );
    } catch (error) {
      throw 'Could not connect to server';
    }
  }
}
