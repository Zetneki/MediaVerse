import { Content } from '../types/content.type';

export interface ProfileReview {
  score: number;
  review: string;
  reviewed_at: string;
  content_type: Content;
  content_title: string;
  content_id: number;
}
