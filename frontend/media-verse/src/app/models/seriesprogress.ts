import { SeriesStatus } from '../utils/series-status.type';
import { Genre } from './genre';
import { SeasonDetails } from './seasondetails';

export interface SeriesProgress {
  id: number;
  name: string;
  poster_path: string | null;
  status: SeriesStatus;
  last_watched?: string;
  current_season: number;
  current_episode: number;
  seasons: SeasonDetails[];
  total_seasons: number;
  total_episodes: number;
  genres?: Genre[];
}
