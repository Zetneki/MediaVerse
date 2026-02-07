const { handleControllerError } = require("../utils/error-response.util");
const tmdbGenreService = require("../services/tmdb/tmdb-genre.service");

exports.getMovieGenres = async (req, res) => {
  try {
    const source = "movie";
    const genres = await tmdbGenreService.getSourceGenres(source);

    res.json(genres);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch movie genres");
  }
};

exports.getSeriesGenres = async (req, res) => {
  try {
    const source = "series";
    const genres = await tmdbGenreService.getSourceGenres(source);

    res.json(genres);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res, "Failed to fetch series genres");
  }
};
