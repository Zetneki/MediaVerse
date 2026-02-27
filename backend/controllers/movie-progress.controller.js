const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const movieProgressService = require("../services/movie-progress.service");
const { MESSAGES } = require("../constants/movie-messages");

const getProgressByMovieId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const movieId = req.params.id;
    if (!movieId) throw AppError.badRequest("Missing movie id");

    const movieProgress = await movieProgressService.getProgressByMovieId(
      userId,
      movieId,
    );
    res.status(200).json(movieProgress);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getMoviesProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "last_watched";
    const sortOrder = req.query.sortOrder || "desc";

    const filters = { status, search, sortBy, sortOrder };

    const movieProgress = await movieProgressService.getMoviesProgress(
      userId,
      page,
      limit,
      filters,
    );
    res.status(200).json(movieProgress);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const setMovieProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { movieId, status } = req.body;
    if (!movieId) throw AppError.badRequest("Missing movie id");
    if (!status) throw AppError.badRequest("Missing status");

    const result = await movieProgressService.setMovieProgress(
      userId,
      movieId,
      status,
    );

    res.status(200).json({
      message: MESSAGES[result.action],
      progress: result.progress ?? null,
    });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const deleteMovieProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const movieId = req.params.id;
    if (!movieId) throw AppError.badRequest("Missing movie id");

    await movieProgressService.deleteMovieProgress(userId, movieId);
    res.status(200).json({ message: "Movie progress successfully deleted" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getProgressByMovieId,
  getMoviesProgress,
  setMovieProgress,
  deleteMovieProgress,
};
