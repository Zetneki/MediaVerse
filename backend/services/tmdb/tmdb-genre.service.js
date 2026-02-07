const tmdbService = require("./tmdb.service");
const genreDao = require("../../dao/genre.dao");
const { isOutdated } = require("../../utils/date.util");

/**
 * Get genres by source
 * @param {string} source - Source (movie or series)
 * @returns {Promise<Object>} Genres
 */

const getSourceGenres = async (source) => {
  const sourceGenres = await genreDao.getGenresBySource(source);

  let outdated = false;
  if (sourceGenres && sourceGenres.length > 0) {
    for (const genre of sourceGenres) {
      if (isOutdated(genre.last_updated)) {
        outdated = true;
        break;
      }
    }
  }

  let genres;
  if (sourceGenres.length === 0 || outdated) {
    const categoryToApiMethod = {
      movie: tmdbService.getMovieGenres(),
      series: tmdbService.getSeriesGenres(),
    };
    const apiMethod = categoryToApiMethod[source];

    const dataFromApi = await apiMethod;

    genres = [];
    for (const genre of dataFromApi) {
      const upserted = await genreDao.upsertGenreCache(source, genre);
      genres.push(upserted);
    }
  } else {
    genres = sourceGenres;
  }

  return genres;
};

module.exports = {
  getSourceGenres,
};
