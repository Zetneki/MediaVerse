import { Series } from './series';

export interface SeriesDetails {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrops: string[];
  trailer?: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  popularity: number;
  total_seasons: number;
  total_episodes: number;
  seasons: {
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  homepage: string | null;
  similar_series: Series[];
}
