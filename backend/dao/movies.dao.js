const pool = require("../config/db");

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
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function getMovieById(id) {
  const res = await pool.query("SELECT * FROM movie_cache WHERE id = $1", [id]);
  return res.rows[0];
}

// --- Page cache ---
async function upsertMoviePageCache(page, category, movieIds) {
  const res = await pool.query(
    `
    INSERT INTO movie_page_cache (page, category, movie_ids, last_updated)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (page, category) DO UPDATE
      SET movie_ids = EXCLUDED.movie_ids,
          last_updated = NOW()
    RETURNING *;
  `,
    [page, category, movieIds]
  );
  return res.rows[0];
}

async function getMoviePageCache(page, category) {
  const res = await pool.query(
    "SELECT * FROM movie_page_cache WHERE page=$1 AND category=$2",
    [page, category]
  );
  return res.rows[0];
}

async function getMoviesByCategory(page, category) {
  const pageCache = await getMoviePageCache(page, category);
  if (!pageCache) return [];

  const res = await pool.query(
    "SELECT * FROM movie_cache WHERE id = ANY($1) ORDER BY array_position($1::bigint[], id)",
    [pageCache.movie_ids]
  );
  return res.rows;
}

// --- Genre cache ---
async function upsertGenreCache(genre) {
  const query = `
    INSERT INTO genre_cache (source, id, name, last_updated)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (source, id) DO UPDATE SET
      name = EXCLUDED.name,
      last_updated = NOW()
    RETURNING *;
  `;
  const values = ["movie", genre.id, genre.name];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function getGenresBySource(source) {
  const res = await pool.query(
    "SELECT * FROM genre_cache WHERE source = $1 ORDER BY name",
    [source]
  );
  return res.rows;
}

//do not need these functions
/*
async function getGenreById(source, id) {
  const res = await pool.query(
    "SELECT * FROM genre_cache WHERE source = $1 AND id = $2",
    [source, id]
  );
  return res.rows[0];
}

// --- Search and filter
async function searchMovies(query, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const res = await pool.query(
    `
    SELECT * FROM movie_cache
    WHERE title ILIKE $1
    ORDER BY id
    LIMIT $2 OFFSET $3
    `,
    [`%${query}%`, limit, offset]
  );
  return res.rows;
}

async function filterMovies({
  genreIds = [],
  sortBy = "popularity.desc",
  page = 1,
  limit = 20,
}) {
  const offset = (page - 1) * limit;

  let whereClause = "";
  let values = [];
  if (genreIds.length > 0) {
    whereClause = "WHERE genres && $1::bigint[]";
    values.push(genreIds);
  }

  let sortByArray = sortBy.split(".");

  const query = `
    SELECT * FROM movie_cache
    ${whereClause}
    ORDER BY ${sortByArray[0]} ${sortByArray[1]}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  values.push(limit, offset);

  const res = await pool.query(query, values);
  return res.rows;
}
*/

module.exports = {
  upsertMovieCache,
  getMovieById,
  upsertMoviePageCache,
  getMoviePageCache,
  getMoviesByCategory,
  upsertGenreCache,
  getGenresBySource,
  //getGenreById,
  //searchMovies,
  //filterMovies,
};
