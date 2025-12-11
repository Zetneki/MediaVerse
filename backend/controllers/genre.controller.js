const tmdbService = require("../services/tmdb.service");
const genreDao = require("../dao/genre.dao");
const { isOutdated } = require("../utils/date.util");

exports.getMovieGenres = async (req, res) => {
  try {
    const source = "movie";
    const movieGenres = await genreDao.getGenresBySource(source);

    let outdated = false;
    if (movieGenres && movieGenres.length > 0) {
      for (const genre of movieGenres) {
        if (isOutdated(genre.last_updated)) {
          outdated = true;
          break;
        }
      }
    }

    let genres;
    if (movieGenres.length === 0 || outdated) {
      const dataFromApi = await tmdbService.getMovieGenres();

      genres = [];
      for (const genre of dataFromApi) {
        const upserted = await genreDao.upsertGenreCache(source, genre);
        genres.push(upserted);
      }
    } else {
      genres = movieGenres;
    }

    res.json(genres);
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Failed to fetch movie genres" });
  }
};

exports.getSeriesGenres = async (req, res) => {
  try {
    const source = "series";
    const seriesGenres = await genreDao.getGenresBySource(source);

    let outdated = false;
    if (seriesGenres && seriesGenres.length > 0) {
      for (const genre of seriesGenres) {
        if (isOutdated(genre.last_updated)) {
          outdated = true;
          break;
        }
      }
    }

    let genres;
    if (seriesGenres.length === 0 || outdated) {
      const dataFromApi = await tmdbService.getSeriesGenres();

      genres = [];
      for (const genre of dataFromApi) {
        const upserted = await genreDao.upsertGenreCache(source, genre);
        genres.push(upserted);
      }
    } else {
      genres = seriesGenres;
    }

    res.json(genres);
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Failed to fetch series genres" });
  }
};
