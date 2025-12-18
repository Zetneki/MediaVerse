const tmdbService = require("../services/tmdb.service");
const moviesDao = require("../dao/movies.dao");
const genreDao = require("../dao/genre.dao");
const { isOutdated } = require("../utils/date.util");

exports.getTopRatedMovies = async (req, res) => {
  try {
    const source = "movie";
    const allGenres = await genreDao.getGenresBySource(source);
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "toprated";

    let pageCache = await moviesDao.getMoviePageCache(page, category);

    if (!pageCache || isOutdated(pageCache.last_updated)) {
      const dataFromApi = await tmdbService.getTopRatedMovies(page);

      for (const movie of dataFromApi.results) {
        const genres = (movie.genre_ids || []).map((id) => ({
          id,
          name: genreMap[id],
        }));

        const movieData = {
          ...movie,
          genres,
        };

        await moviesDao.upsertMovieCache(movieData);
      }

      pageCache = await moviesDao.upsertMoviePageCache(
        page,
        category,
        dataFromApi.results.map((m) => m.id),
        dataFromApi.total_results
      );
    }

    const data = await moviesDao.getMoviesByCategory(page, category);

    res.json({
      page: page,
      total_results: pageCache.total_results,
      results: data,
    });
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch top rated movies" });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const source = "movie";
    const allGenres = await genreDao.getGenresBySource(source);
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "popular";

    let pageCache = await moviesDao.getMoviePageCache(page, category);

    if (!pageCache || isOutdated(pageCache.last_updated)) {
      const dataFromApi = await tmdbService.getPopularMovies(page);

      for (const movie of dataFromApi.results) {
        const genres = (movie.genre_ids || []).map((id) => ({
          id,
          name: genreMap[id],
        }));

        const movieData = {
          ...movie,
          genres,
        };

        await moviesDao.upsertMovieCache(movieData);
      }

      pageCache = await moviesDao.upsertMoviePageCache(
        page,
        category,
        dataFromApi.results.map((m) => m.id),
        dataFromApi.total_results
      );
    }

    const data = await moviesDao.getMoviesByCategory(page, category);

    res.json({
      page: page,
      total_results: pageCache.total_results,
      results: data,
    });
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch popularmovies" });
  }
};

exports.searchMovies = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query)
      return res.status(400).json({ error: "Missing query parameter" });

    const data = await tmdbService.searchMovies({
      query: query,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch searched movies" });
  }
};

exports.filterMovies = async (req, res) => {
  try {
    const { genreIds, sortBy, page } = req.query;

    const parsedGenreIds = genreIds
      ? genreIds.split(",").map((g) => parseInt(g, 10))
      : [];

    const data = await tmdbService.filterMovies({
      genreIds: parsedGenreIds,
      sortBy: sortBy || null,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch filtered movies" });
  }
};

exports.searchMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing movie ID" });

    let movie = await moviesDao.getMovieById(id);
    if (!movie || isOutdated(movie.last_updated)) {
      const dataFromApi = await tmdbService.searchMovieDetails(id);
      movie = await moviesDao.upsertMovieCache(dataFromApi, true);
    }

    res.json({ results: movie });
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
};
