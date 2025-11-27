const tmdbService = require("../services/tmdb.service");

exports.getTopRatedSeries = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const data = await tmdbService.getTopRatedSeries(page);

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch top rated series" });
  }
};

exports.getPopularSeries = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const data = await tmdbService.getPopularSeries(page);

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch popular series" });
  }
};

exports.searchSeries = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query)
      return res.status(400).json({ error: "Missing query parameter" });

    const data = await tmdbService.searchSeries({
      query: query,
      page: page ? parseInt(page, 10) : 1,
    });

    res.json(data);
  } catch (err) {
    //console.log(err);
    res.status(500).json({ error: "Failed to fetch searched series" });
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
    res.status(500).json({ error: "Failed to fetch filtered series" });
  }
};

exports.searchSeriesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing series ID" });

    const data = await tmdbService.searchSeriesDetails(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch series details" });
  }
};
