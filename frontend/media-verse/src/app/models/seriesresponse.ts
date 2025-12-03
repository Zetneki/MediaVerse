import { Series } from './series';

export interface SeriesResponse {
  page: number;
  results: Series[];
  total_pages: number;
  total_results: number;
}
