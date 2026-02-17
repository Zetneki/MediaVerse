import { MovieStatus } from '../utils/movie-status.type';
import { Genre } from './genre';

export interface MovieProgress {
  id: number;
  title: string;
  poster_path: string | null;
  status: MovieStatus;
  last_watched?: string;
  genres?: Genre[];
}
