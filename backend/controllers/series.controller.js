const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const tmdbService = require("../services/tmdb.service");
const seriesDao = require("../dao/series.dao");
const genreDao = require("../dao/genre.dao");
const { isOutdated } = require("../utils/date.util");

exports.getTopRatedSeries = async (req, res) => {
  try {
    const source = "series";
    const allGenres = await genreDao.getGenresBySource(source);
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "toprated";

    let pageCache = await seriesDao.getSeriesPageCache(page, category);

    if (!pageCache || isOutdated(pageCache.last_updated)) {
      const dataFromApi = await tmdbService.getTopRatedSeries(page);

      for (const series of dataFromApi.results) {
        const genres = (series.genre_ids || []).map((id) => ({
          id,
          name: genreMap[id],
        }));

        const seriesData = {
          ...series,
          genres,
        };

        await seriesDao.upsertSeriesCache(seriesData);
      }

      pageCache = await seriesDao.upsertSeriesPageCache(
        page,
        category,
        dataFromApi.results.map((s) => s.id),
        dataFromApi.total_results,
      );
    }

    const data = await seriesDao.getSeriesByCategory(page, category);

    res.json({
      page: page,
      total_results: pageCache.total_results,
      results: data,
    });
  } catch (err) {
    //console.log(err);
    //res.status(500).json({ error: "Failed to fetch top rated series" });
    handleControllerError(err, res, "Failed to fetch top rated series");
  }
};

exports.getPopularSeries = async (req, res) => {
  try {
    const source = "series";
    const allGenres = await genreDao.getGenresBySource(source);
    const genreMap = {};
    allGenres.forEach((g) => {
      genreMap[g.id] = g.name;
    });

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = "popular";

    let pageCache = await seriesDao.getSeriesPageCache(page, category);

    if (!pageCache || isOutdated(pageCache.last_updated)) {
      const dataFromApi = await tmdbService.getPopularSeries(page);

      for (const series of dataFromApi.results) {
        const genres = (series.genre_ids || []).map((id) => ({
          id,
          name: genreMap[id],
        }));

        const seriesData = {
          ...series,
          genres,
        };

        await seriesDao.upsertSeriesCache(seriesData);
      }

      pageCache = await seriesDao.upsertSeriesPageCache(
        page,
        category,
        dataFromApi.results.map((s) => s.id),
        dataFromApi.total_results,
      );
    }

    const data = await seriesDao.getSeriesByCategory(page, category);

    res.json({
      page: page,
      total_results: pageCache.total_results,
      results: data,
    });
  } catch (err) {
    //console.log(err);
    //res.status(500).json({ error: "Failed to fetch popular series" });
    handleControllerError(err, res, "Failed to fetch popular series");
  }
};

exports.searchSeries = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query)
      //return res.status(400).json({ error: "Missing query parameter" });
      throw AppError.badRequest("Missing query parameter");

    const data = await tmdbService.searchSeries({
      query: query,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    //res.status(500).json({ error: "Failed to fetch searched series" });
    handleControllerError(err, res, "Failed to fetch searched series");
  }
};

exports.filterSeries = async (req, res) => {
  try {
    const { genreIds, sortBy, page } = req.query;

    const parsedGenreIds = genreIds
      ? genreIds.split(",").map((g) => parseInt(g, 10))
      : [];

    const data = await tmdbService.filterSeries({
      genreIds: parsedGenreIds,
      sortBy: sortBy || null,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    //res.status(500).json({ error: "Failed to fetch filtered series" });
    handleControllerError(err, res, "Failed to fetch filtered series");
  }
};

exports.searchSeriesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    //if (!id) return res.status(400).json({ error: "Missing series ID" });
    if (!id) throw AppError.badRequest("Missing series ID");

    let series = await seriesDao.getSeriesById(id);
    if (!series || isOutdated(series.last_updated)) {
      const dataFromApi = await tmdbService.searchSeriesDetails(id);
      series = await seriesDao.upsertSeriesCache(dataFromApi, true);
    }

    res.json(series);
  } catch (err) {
    //console.log(err);
    //res.status(500).json({ error: "Failed to fetch series details" });
    handleControllerError(err, res, "Failed to fetch series details");
  }
};
