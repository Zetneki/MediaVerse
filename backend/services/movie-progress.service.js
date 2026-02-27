const movieProgressDao = require("../dao/movie-progress.dao");
const usersDao = require("../dao/users.dao");
const moviesDao = require("../dao/movies.dao");
const { VALID_MOVIE_STATUSES } = require("../constants/movie-status");
const { VALID_MOVIE_ORDERS } = require("../constants/movie-order");
const { VALID_MOVIE_SORTBYS } = require("../constants/movie-sortby");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get progress by movie id
 * @param {number} userId
 * @param {string} movieId
 * @returns {Promise<Object>} Movie progress
 */

const getProgressByMovieId = async (userId, movieId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const movie = await moviesDao.getMovieById(movieId);
  if (!movie) throw AppError.notFound("Movie not found");

  return await movieProgressDao.getProgressByMovieId(userId, movieId);
};

/**
 * Get paginated movie progresses
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @param {status, search, sortBy, sortOrder} filters
 * @returns {Promise<Array<Object>>} Movie progress
 */

const getMoviesProgress = async (
  userId,
  page = 1,
  limit = 20,
  filters = {},
) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  if (page < 1) throw AppError.badRequest("Page must be >= 1");
  if (limit < 1 || limit > 100)
    throw AppError.badRequest("Limit must be between 1 and 100");
  if (filters.status !== "" && !VALID_MOVIE_STATUSES.includes(filters.status)) {
    throw AppError.badRequest(
      `Invalid status. Must be one of: ${VALID_MOVIE_STATUSES.join(", ")}`,
    );
  }
  if (!VALID_MOVIE_ORDERS.includes(filters.sortOrder))
    throw AppError.badRequest(
      `Invalid sort order. Must be one of: ${VALID_MOVIE_ORDERS.join(", ")}`,
    );
  if (!VALID_MOVIE_SORTBYS.includes(filters.sortBy))
    throw AppError.badRequest(
      `Invalid sort field. Must be one of: ${VALID_MOVIE_SORTBYS.join(", ")}`,
    );

  return await movieProgressDao.getMoviesWithDetails(
    userId,
    page,
    limit,
    filters,
  );
};

/**
 * Set movie progress
 * @param {number} userId
 * @param {string} status
 * @returns {Promise<{action: string}>} - action: INSERTED, UPDATED, UNCHANGED
 */

const setMovieProgress = async (userId, movieId, status) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const movie = await moviesDao.getMovieById(movieId);
  if (!movie) throw AppError.notFound("Movie not found");

  if (!VALID_MOVIE_STATUSES.includes(status)) {
    throw AppError.badRequest(
      `Invalid status. Must be one of: ${VALID_MOVIE_STATUSES.join(", ")}`,
    );
  }

  try {
    const result = await movieProgressDao.upsertMovieProgress(
      userId,
      movieId,
      status,
    );

    if (!result) return { action: "UNCHANGED" };

    return {
      action: result.inserted ? "INSERTED" : "UPDATED",
      progress: {
        status: result.status,
        last_watched: result.last_watched,
      },
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Delete movie progress
 * @param {number} userId
 * @param {string} movieId
 * @returns {Promise<void>}
 */

const deleteMovieProgress = async (userId, movieId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const movie = await movieProgressDao.getProgressByMovieId(userId, movieId);
  if (!movie) throw AppError.notFound("Movie not found");

  try {
    await movieProgressDao.deleteMovieProgress(userId, movieId);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getProgressByMovieId,
  getMoviesProgress,
  setMovieProgress,
  deleteMovieProgress,
};
