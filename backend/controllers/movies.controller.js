const tmdbService = require("../services/tmdb.service");
const moviesDao = require("../dao/movies.dao");

function isOutdated(lastUpdated, maxAgeMinutes = 1) {
  if (!lastUpdated) return true;
  const now = new Date();
  const diff = (now - new Date(lastUpdated)) / 1000 / 60; //minutes
  return diff > maxAgeMinutes;
}

/*
exports.createMovie = async (req, res) => {
  try {
    
    const movie = {
      id: 1,
      title: "asd",
      overview: "most modositottam",
      release_date: new Date(),
    };
    await moviesDao.upsertMovieCache(movie);
    const getMovieById = await moviesDao.getMovieById(1);
    res.json(getMovieById);

    const data = await tmdbService.getMovieGenres();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create movie" });
  }
};
*/

exports.getMovieGenres = async (req, res) => {
  try {
    const movieGenres = await moviesDao.getGenresBySource("movie");

    let outdated = false;
    if (movieGenres && movieGenres.length > 0) {
      for (const genre of movieGenres) {
        if (isOutdated(genre.last_updated)) {
          outdated = true;
          break;
        }
      }
    }

    let genres;
    if (movieGenres.length === 0 || outdated) {
      const dataFromApi = await tmdbService.getMovieGenres();

      genres = [];
      for (const genre of dataFromApi) {
        const upserted = await moviesDao.upsertGenreCache(genre);
        genres.push(upserted);
      }
    } else {
      genres = movieGenres;
    }

    res.json(genres);
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Failed to fetch movie genres" });
  }
};

exports.getTopRatedMovies = async (req, res) => {
  try {
    const allGenres = await moviesDao.getGenresBySource("movie");
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "toprated";

    const pageCache = await moviesDao.getMoviePageCache(page, category);

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

      await moviesDao.upsertMoviePageCache(
        page,
        category,
        dataFromApi.results.map((m) => m.id)
      );
    }

    const data = await moviesDao.getMoviesByCategory(page, category);

    res.json({ results: data });
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch top rated movies" });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const allGenres = await moviesDao.getGenresBySource("movie");
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "popular";

    const pageCache = await moviesDao.getMoviePageCache(page, category);

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

      await moviesDao.upsertMoviePageCache(
        page,
        category,
        dataFromApi.results.map((m) => m.id)
      );
    }

    const data = await moviesDao.getMoviesByCategory(page, category);

    res.json({ results: data });
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
    const id = BigInt(req.params.id);
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
