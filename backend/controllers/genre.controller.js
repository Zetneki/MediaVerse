const tmdbService = require("../services/tmdb.service");

exports.getMovieGenres = async (req, res) => {
  try {
    const data = await tmdbService.getMovieGenres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movie genres" });
  }
};

exports.getSeriesGenres = async (req, res) => {
  try {
    const data = await tmdbService.getSeriesGenres();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch series genres" });
  }
};
