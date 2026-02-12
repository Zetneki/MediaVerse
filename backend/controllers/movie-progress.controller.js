const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const movieProgressService = require("../services/movie-progress.service");
const { MESSAGES } = require("../constants/movie-messages");

const getMoviesProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const movieProgress = await movieProgressService.getMoviesProgress(userId);
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

    const { action } = await movieProgressService.setMovieProgress(
      userId,
      movieId,
      status,
    );

    res.status(200).json(MESSAGES[action]);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const deleteMovieProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { movieId } = req.body;
    if (!movieId) throw AppError.badRequest("Missing movie id");

    await movieProgressService.deleteMovieProgress(userId, movieId);
    res.status(200).json({ message: "Movie progress successfully deleted" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getMoviesProgress,
  setMovieProgress,
  deleteMovieProgress,
};
