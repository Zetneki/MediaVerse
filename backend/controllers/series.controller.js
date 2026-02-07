const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const tmdbSeriesService = require("../services/tmdb/tmdb-series.service");

exports.getTopRatedSeries = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "toprated";

    const data = await tmdbSeriesService.getPaginatedSeries(page, category);
    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch top rated series");
  }
};

exports.getPopularSeries = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "popular";

    const data = await tmdbSeriesService.getPaginatedSeries(page, category);
    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch popular series");
  }
};

exports.searchSeries = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query) throw AppError.badRequest("Missing query parameter");

    const data = await tmdbSeriesService.searchSeries(
      query,
      page ? parseInt(page, 10) : 1,
    );

    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch searched series");
  }
};

exports.filterSeries = async (req, res) => {
  try {
    const { genreIds, sortBy, page } = req.query;

    const parsedGenreIds = genreIds
      ? genreIds.split(",").map((g) => parseInt(g, 10))
      : [];

    const data = await tmdbSeriesService.filterSeries(
      parsedGenreIds,
      sortBy || null,
      page ? parseInt(page, 10) : 1,
    );

    res.json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch filtered series");
  }
};

exports.searchSeriesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw AppError.badRequest("Missing series ID");

    const series = await tmdbSeriesService.getSeriesDetails(id);
    res.json(series);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch series details");
  }
};
