import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DetailReviewsResponse } from '../models/detailreviewsresponse';
import { ProfileReviewsResponse } from '../models/profilereviewsresponse';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getReviewsByContent(
    contentId: number,
    contentType: string,
    page: number = 1,
    limit: number = 20,
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<DetailReviewsResponse>(
      `${this.baseUrl}/user-reviews/${contentType}/${contentId}`,
      { params },
    );
  }

  getUserReviews(page: number = 1, limit: number = 20, search: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProfileReviewsResponse>(
      `${this.baseUrl}/user-reviews`,
      { params },
    );
  }

  upsertReview(
    contentId: number,
    contentType: string,
    score: number,
    review: string,
  ) {
    return this.http.post(`${this.baseUrl}/user-reviews`, {
      contentId,
      contentType,
      score,
      review,
    });
  }

  deleteReview(contentId: number, contentType: string) {
    return this.http.delete(
      `${this.baseUrl}/user-reviews/${contentType}/${contentId}`,
    );
  }
}
