const cron = require("node-cron");
const moviesDao = require("../dao/movies.dao");
const tmdbMoviesService = require("../services/tmdb/tmdb-movies.service");

cron.schedule("0 * * * *", async () => {
  console.log("Refreshing tracked movies...");

  try {
    const outdatedTracked = await moviesDao.getOutdatedTrackedMovies(50);

    await Promise.all(
      outdatedTracked.map((movie) =>
        tmdbMoviesService.getMovieDetails(movie.id),
      ),
    );

    console.log(`Refreshed ${outdatedTracked.length} movies`);
  } catch (err) {
    console.error("Cron movie refresh error:", err);
  }
});
