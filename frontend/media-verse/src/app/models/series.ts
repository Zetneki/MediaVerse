export interface Series {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date?: string;
  popularity?: number;
  genre_ids?: number[];
}
