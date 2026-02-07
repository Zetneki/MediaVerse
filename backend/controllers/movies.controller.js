const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const tmdbMoviesService = require("../services/tmdb/tmdb-movies.service");

exports.getTopRatedMovies = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "toprated";

    const data = await tmdbMoviesService.getPaginatedMovies(page, category);
    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch top rated movies");
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "popular";

    const data = await tmdbMoviesService.getPaginatedMovies(page, category);
    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch popularmovies");
  }
};

exports.searchMovies = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query) throw AppError.badRequest("Missing query parameter");

    const data = await tmdbMoviesService.searchMovies(
      query,
      page ? parseInt(page, 10) : 1,
    );

    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch searched movies");
  }
};

exports.filterMovies = async (req, res) => {
  try {
    const { genreIds, sortBy, page } = req.query;

    const parsedGenreIds = genreIds
      ? genreIds.split(",").map((g) => parseInt(g, 10))
      : [];

    const data = await tmdbMoviesService.filterMovies(
      parsedGenreIds,
      sortBy || null,
      page ? parseInt(page, 10) : 1,
    );

    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch filtered movies");
  }
};

exports.searchMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw AppError.badRequest("Missing movie ID");

    const movie = await tmdbMoviesService.getMovieDetails(id);
    res.json(movie);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch movie details");
  }
};
