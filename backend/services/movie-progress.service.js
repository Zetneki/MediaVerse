const movieProgressDao = require("../dao/movie-progress.dao");
const usersDao = require("../dao/users.dao");
const { VALID_MOVIE_STATUSES } = require("../constants/movie-status");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get all movie progresses
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Movie progress
 */

const getMoviesProgress = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  return await movieProgressDao.getUserMoviesWithDetails(userId);
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

  try {
    await movieProgressDao.deleteMovieProgress(userId, movieId);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getMoviesProgress,
  setMovieProgress,
  deleteMovieProgress,
};
