const tmdbService = require("./tmdb.service");
const moviesDao = require("../../dao/movies.dao");
const genreDao = require("../../dao/genre.dao");
const { isOutdated } = require("../../utils/date.util");

/**
 * Build genre map for movies
 */

async function getGenreMap() {
  const source = "movie";
  const allGenres = await genreDao.getGenresBySource(source);
  const genreMap = {};
  allGenres.forEach((g) => {
    genreMap[g.id] = g.name;
  });
  return genreMap;
}

/**
 * Get paginated movies by category (toprated, popular)
 *  @param {number} page - Page number
 * @param {string} category - "toprated" or "popular"
 * @returns {Promise<Object>} - Paginated movies
 */

const getPaginatedMovies = async (page, category) => {
  const genreMap = await getGenreMap();

  let pageCache = await moviesDao.getMoviePageCache(page, category);

  if (!pageCache || isOutdated(pageCache.last_updated)) {
    const categoryToApiMethod = {
      toprated: tmdbService.getTopRatedMovies(page),
      popular: tmdbService.getPopularMovies(page),
    };
    const apiMethod = categoryToApiMethod[category];

    const dataFromApi = await apiMethod;

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
      dataFromApi.total_results,
    );
  }

  const data = await moviesDao.getMoviesByCategory(page, category);

  return {
    page: page,
    total_results: pageCache.total_results,
    results: data,
  };
};

/**
 * Search movies by query
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */

const searchMovies = async (query, page) => {
  return tmdbService.searchMovies({ query, page });
};

/**
 * Filter movies by genres and sort
 * @param {Array<number>} genreIds - Genre IDs
 * @param {string} sortBy - Sort option
 * @param {number} page - Page number
 * @returns {Promise<Object>} Filtered results
 */

const filterMovies = async (genreIds, sortBy, page) => {
  return tmdbService.filterMovies({ genreIds, sortBy, page });
};

/**
 * Get movie details by ID
 * @param {string|number} movieId - Movie ID
 * @returns {Promise<Object>} Movie details
 */

const getMovieDetails = async (movieId) => {
  let movie = await moviesDao.getMovieById(movieId);

  if (!movie || isOutdated(movie.last_updated)) {
    const dataFromApi = await tmdbService.searchMovieDetails(movieId);
    movie = await moviesDao.upsertMovieCache(dataFromApi, true);
  }

  return movie;
};

module.exports = {
  getPaginatedMovies,
  searchMovies,
  filterMovies,
  getMovieDetails,
};
