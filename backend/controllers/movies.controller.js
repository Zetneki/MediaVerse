const tmdbService = require("../services/tmdb.service");

exports.getTopRatedMovies = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const data = await tmdbService.getTopRatedMovies(page);

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch top rated movies" });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const data = await tmdbService.getPopularMovies(page);

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch popularmovies" });
  }
};

exports.searchMovies = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query)
      return res.status(400).json({ error: "Missing query parameter" });

    const data = await tmdbService.searchMovies({
      query: query,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch searched movies" });
  }
};

exports.filterMovies = async (req, res) => {
  try {
    const { genreIds, sortBy, page } = req.query;

    const parsedGenreIds = genreIds
      ? genreIds.split(",").map((g) => parseInt(g, 10))
      : [];

    const data = await tmdbService.filterMovies({
      genreIds: parsedGenreIds,
      sortBy: sortBy || null,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch filtered movies" });
  }
};

exports.searchMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing movie ID" });

    const data = await tmdbService.searchMovieDetails(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
};
