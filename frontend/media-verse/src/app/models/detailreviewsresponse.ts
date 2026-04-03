import { DetailReview } from './detailreview';
import { UserReview } from './userreview';

export interface DetailReviewsResponse {
  items: DetailReview[];
  total: number;
  userReview?: UserReview;
}
