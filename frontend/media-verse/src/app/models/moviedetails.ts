import { Genre } from './genre';
import { Movie } from './movie';

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrops: string[];
  trailer?: string | null;
  vote_average: number;
  genres: Genre[];
  popularity: number;
  runtime: number | null;
  homepage: string | null;
  similar_movies?: Movie[];
}
