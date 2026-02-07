const tmdbService = require("./tmdb.service");
const seriesDao = require("../../dao/series.dao");
const genreDao = require("../../dao/genre.dao");
const { isOutdated } = require("../../utils/date.util");

/**
 * Build genre map for series
 */

async function getGenreMap() {
  const source = "series";
  const allGenres = await genreDao.getGenresBySource(source);
  const genreMap = {};
  allGenres.forEach((g) => {
    genreMap[g.id] = g.name;
  });
  return genreMap;
}

/**
 * Get paginated series by category (toprated, popular)
 *  @param {number} page - Page number
 * @param {string} category - "toprated" or "popular"
 * @returns {Promise<Object>} - Paginated series
 */

const getPaginatedSeries = async (page, category) => {
  const genreMap = await getGenreMap();

  let pageCache = await seriesDao.getSeriesPageCache(page, category);

  if (!pageCache || isOutdated(pageCache.last_updated)) {
    const categoryToApiMethod = {
      toprated: tmdbService.getTopRatedSeries(page),
      popular: tmdbService.getPopularSeries(page),
    };
    const apiMethod = categoryToApiMethod[category];

    const dataFromApi = await apiMethod;

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

  return {
    page: page,
    total_results: pageCache.total_results,
    results: data,
  };
};

/**
 * Search series by query
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */

const searchSeries = async (query, page) => {
  return tmdbService.searchSeries({ query, page });
};

/**
 * Filter series by genres and sort
 * @param {Array<number>} genreIds - Genre IDs
 * @param {string} sortBy - Sort option
 * @param {number} page - Page number
 * @returns {Promise<Object>} Filtered results
 */

const filterSeries = async (genreIds, sortBy, page) => {
  return tmdbService.filterSeries({ genreIds, sortBy, page });
};

/**
 * Get series details by ID
 * @param {string|number} seriesId - Series ID
 * @returns {Promise<Object>} Series details
 */

const getSeriesDetails = async (seriesId) => {
  let series = await seriesDao.getSeriesByCategory(seriesId);

  if (!series || isOutdated(series.last_updated)) {
    const dataFromApi = await tmdbService.searchSeriesDetails(seriesId);
    series = await seriesDao.upsertSeriesCache(dataFromApi, true);
  }

  return series;
};

module.exports = {
  getPaginatedSeries,
  searchSeries,
  filterSeries,
  getSeriesDetails,
};
