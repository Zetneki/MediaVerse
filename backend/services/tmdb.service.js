const axios = require("axios");

class TmdbService {
  constructor(apiKey) {
    if (!apiKey) throw new Error("TMDB_API_KEY missing");
    this.apiKey = apiKey;
    this.api = axios.create({
      baseURL: "https://api.themoviedb.org/3",
      params: { api_key: this.apiKey, language: "en-US" },
    });
  }

  // MOVIES
  async getTopRatedMovies(page = 1) {
    const res = await this.api.get("/movie/top_rated", {
      params: { page },
    });

    return res.data;
  }

  async getPopularMovies(page = 1) {
    const res = await this.api.get("/movie/popular", {
      params: { page },
    });

    return res.data;
  }

  async searchMovies({ query, page = 1 }) {
    const params = { query, page };

    const res = await this.api.get("/search/movie", { params });
    return res.data;
  }

  async filterMovies({ genreIds, sortBy, page = 1 }) {
    const params = { page, include_adult: false };

    if ((!genreIds || genreIds.length === 0) && !sortBy) {
      throw new Error(
        "Missing filter parameters (genreIds or sortBy required)"
      );
    }

    if (genreIds && genreIds.length > 0)
      params.with_genres = genreIds.join(",");
    if (sortBy) params.sort_by = sortBy;

    const res = await this.api.get("/discover/movie", { params });
    return res.data;
  }

  async searchMovieDetails(movieId) {
    if (!movieId) throw new Error("Missing movie ID");

    const res = await this.api.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "images,videos,credits,similar",
      },
    });

    const data = res.data;

    // first ten imgs
    const backdrops =
      data.images?.backdrops?.slice(0, 10).map((img) => img.file_path) || [];

    // first trailer
    const trailer = data.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    const trailerUrl = trailer
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;

    const similarMovies = data.similar?.results || [];

    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      release_date: data.release_date,
      poster_path: data.poster_path,
      backdrops,
      trailer: trailerUrl,
      vote_average: data.vote_average,
      genres: data.genres,
      popularity: data.popularity,
      runtime: data.runtime,
      homepage: data.homepage,
      similar_movies: similarMovies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      })),
    };
  }

  async getMovieGenres() {
    const res = await this.api.get("/genre/movie/list");
    return res.data.genres;
  }

  // SERIES
  async getTopRatedSeries(page = 1) {
    const res = await this.api.get("/tv/top_rated", {
      params: { page },
    });

    return res.data;
  }

  async getPopularSeries(page = 1) {
    const res = await this.api.get("/tv/popular", {
      params: { page },
    });

    return res.data;
  }

  async searchSeries({ query, page = 1 }) {
    const params = { query, page };

    const res = await this.api.get("/search/tv", { params });
    return res.data;
  }

  async filterSeries({ genreIds, sortBy, page = 1 }) {
    const params = { page, include_adult: false };

    if ((!genreIds || genreIds.length === 0) && !sortBy) {
      throw new Error(
        "Missing filter parameters (genreIds or sortBy required)"
      );
    }

    if (genreIds && genreIds.length > 0)
      params.with_genres = genreIds.join(",");
    if (sortBy) params.sort_by = sortBy;

    const res = await this.api.get("/discover/tv", { params });
    return res.data;
  }

  async searchSeriesDetails(tvId) {
    if (!tvId) throw new Error("Missing TV ID");

    const res = await this.api.get(`/tv/${tvId}`, {
      params: { append_to_response: "images,videos,credits,similar" },
    });

    const data = res.data;

    const backdrops =
      data.images?.backdrops?.slice(0, 10).map((img) => img.file_path) || [];

    const trailer = data.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    const trailerUrl = trailer
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;

    const totalEpisodes = data.seasons?.reduce(
      (sum, s) => sum + (s.episode_count || 0),
      0
    );

    const similarSeries = data.similar?.results || [];

    return {
      id: data.id,
      name: data.name,
      overview: data.overview,
      first_air_date: data.first_air_date,
      poster_path: data.poster_path,
      backdrops,
      trailer: trailerUrl,
      vote_average: data.vote_average,
      genres: data.genres,
      popularity: data.popularity,
      total_seasons: data.number_of_seasons,
      total_episodes: totalEpisodes,
      seasons: data.seasons.map((s) => ({
        season_number: s.season_number,
        episode_count: s.episode_count,
        poster_path: s.poster_path,
      })),
      homepage: data.homepage,
      similar_series: similarSeries.map((series) => ({
        id: series.id,
        name: series.name,
        poster_path: series.poster_path,
        vote_average: series.vote_average,
      })),
    };
  }

  async getSeriesGenres() {
    const res = await this.api.get("/genre/tv/list");
    return res.data.genres;
  }
}

module.exports = new TmdbService(process.env.TMDB_API_KEY);
