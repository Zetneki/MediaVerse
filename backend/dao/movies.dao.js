const db = require("../config/db");

// --- Movie cache ---
async function upsertMovieCache(movie, updateLastUpdated = false) {
  const query = `
    INSERT INTO movie_cache (id, title, overview, release_date, poster_path, backdrops, trailer, vote_average, genres, popularity, runtime, homepage, similar_movies, last_updated)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
    ON CONFLICT (id) DO UPDATE SET
      title = COALESCE(EXCLUDED.title, movie_cache.title),
      overview = COALESCE(EXCLUDED.overview, movie_cache.overview),
      release_date = COALESCE(EXCLUDED.release_date, movie_cache.release_date),
      poster_path = COALESCE(EXCLUDED.poster_path, movie_cache.poster_path),
      backdrops = COALESCE(EXCLUDED.backdrops, movie_cache.backdrops),
      trailer = COALESCE(EXCLUDED.trailer, movie_cache.trailer),
      vote_average = COALESCE(EXCLUDED.vote_average, movie_cache.vote_average),
      genres = COALESCE(EXCLUDED.genres, movie_cache.genres),
      popularity = COALESCE(EXCLUDED.popularity, movie_cache.popularity),
      runtime = COALESCE(EXCLUDED.runtime, movie_cache.runtime),
      homepage = COALESCE(EXCLUDED.homepage, movie_cache.homepage),
      similar_movies = COALESCE(EXCLUDED.similar_movies, movie_cache.similar_movies)
      ${updateLastUpdated ? ", last_updated = NOW()" : ""}
    RETURNING *;
  `;
  const values = [
    movie.id,
    movie.title,
    movie.overview,
    movie.release_date,
    movie.poster_path,
    movie.backdrops || null,
    movie.trailer,
    movie.vote_average,
    movie.genres ? JSON.stringify(movie.genres) : null,
    movie.popularity,
    movie.runtime,
    movie.homepage,
    movie.similar_movies ? JSON.stringify(movie.similar_movies) : null,
  ];
  const res = await db.query(query, values);
  return res.rows[0];
}

async function getMovieById(id) {
  const res = await db.query("SELECT * FROM movie_cache WHERE id = $1", [id]);
  return res.rows[0];
}

// --- Page cache ---
async function upsertMoviePageCache(page, category, movieIds, totalPages) {
  const res = await db.query(
    `
    INSERT INTO movie_page_cache (page, category, movie_ids, total_results, last_updated)
    VALUES ($1,$2,$3,$4,NOW())
    ON CONFLICT (page, category) DO UPDATE
      SET movie_ids = EXCLUDED.movie_ids,
          total_results = EXCLUDED.total_results,
          last_updated = NOW()
    RETURNING *;
  `,
    [page, category, movieIds, totalPages],
  );
  return res.rows[0];
}

async function getMoviePageCache(page, category) {
  const res = await db.query(
    "SELECT * FROM movie_page_cache WHERE page=$1 AND category=$2",
    [page, category],
  );
  return res.rows[0];
}

async function getMoviesByCategory(page, category) {
  const pageCache = await getMoviePageCache(page, category);
  if (!pageCache) return [];

  const res = await db.query(
    "SELECT * FROM movie_cache WHERE id = ANY($1) ORDER BY array_position($1::bigint[], id)",
    [pageCache.movie_ids],
  );
  return res.rows;
}

async function getOutdatedTrackedMovies(limit = 20) {
  const res = await db.query(
    `
    SELECT m.id
    FROM movie_cache m
    JOIN user_movie_progress p ON p.movie_id = m.id
    WHERE m.last_updated < NOW() - INTERVAL '24 hours'
    GROUP BY m.id, m.last_updated  
    ORDER BY m.last_updated ASC
    LIMIT $1
    `,
    [limit],
  );

  return res.rows;
}

module.exports = {
  upsertMovieCache,
  getMovieById,
  upsertMoviePageCache,
  getMoviePageCache,
  getMoviesByCategory,
  getOutdatedTrackedMovies,
};
