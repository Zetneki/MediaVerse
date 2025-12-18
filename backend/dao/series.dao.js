const pool = require("../config/db");

// --- Series cache ---
async function upsertSeriesCache(series, updateLastUpdated = false) {
  const query = `
    INSERT INTO series_cache (id, name, overview, first_air_date, poster_path, backdrops, trailer, vote_average, genres, popularity, total_seasons, total_episodes, seasons, homepage, similar_series, last_updated)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, series_cache.name),
      overview = COALESCE(EXCLUDED.overview, series_cache.overview),
      first_air_date = COALESCE(EXCLUDED.first_air_date, series_cache.first_air_date),
      poster_path = COALESCE(EXCLUDED.poster_path, series_cache.poster_path),
      backdrops = COALESCE(EXCLUDED.backdrops, series_cache.backdrops),
      trailer = COALESCE(EXCLUDED.trailer, series_cache.trailer),
      vote_average = COALESCE(EXCLUDED.vote_average, series_cache.vote_average),
      genres = COALESCE(EXCLUDED.genres, series_cache.genres),
      popularity = COALESCE(EXCLUDED.popularity, series_cache.popularity),
      total_seasons = COALESCE(EXCLUDED.total_seasons, series_cache.total_seasons),
      total_episodes = COALESCE(EXCLUDED.total_episodes, series_cache.total_episodes),
      seasons = COALESCE(EXCLUDED.seasons, series_cache.seasons),
      homepage = COALESCE(EXCLUDED.homepage, series_cache.homepage),
      similar_series = COALESCE(EXCLUDED.similar_series, series_cache.similar_series)
      ${updateLastUpdated ? ", last_updated = NOW()" : ""}
    RETURNING *;
  `;
  const values = [
    series.id,
    series.name,
    series.overview,
    series.first_air_date,
    series.poster_path,
    series.backdrops || null,
    series.trailer,
    series.vote_average,
    series.genres ? JSON.stringify(series.genres) : null,
    series.popularity,
    series.total_seasons,
    series.total_episodes,
    series.seasons ? JSON.stringify(series.seasons) : null,
    series.homepage,
    series.similar_series ? JSON.stringify(series.similar_series) : null,
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function getSeriesById(id) {
  const res = await pool.query("SELECT * FROM series_cache WHERE id = $1", [
    id,
  ]);
  return res.rows[0];
}

// --- Page cache ---

async function upsertSeriesPageCache(page, category, seriesIds, totalPages) {
  const res = await pool.query(
    `
    INSERT INTO series_page_cache (page, category, series_ids, total_results, last_updated)
    VALUES ($1,$2,$3,$4,NOW())
    ON CONFLICT (page, category) DO UPDATE
      SET series_ids = EXCLUDED.series_ids,
          total_results = EXCLUDED.total_results,
          last_updated = NOW()
    RETURNING *;
  `,
    [page, category, seriesIds, totalPages]
  );
  return res.rows[0];
}

async function getSeriesPageCache(page, category) {
  const res = await pool.query(
    "SELECT * FROM series_page_cache WHERE page=$1 AND category=$2",
    [page, category]
  );
  return res.rows[0];
}

async function getSeriesByCategory(page, category) {
  const pageCache = await getSeriesPageCache(page, category);
  if (!pageCache) return [];

  const res = await pool.query(
    "SELECT * FROM series_cache WHERE id = ANY($1) ORDER BY array_position($1::bigint[], id)",
    [pageCache.series_ids]
  );
  return res.rows;
}

module.exports = {
  upsertSeriesCache,
  getSeriesById,
  upsertSeriesPageCache,
  getSeriesPageCache,
  getSeriesByCategory,
};
