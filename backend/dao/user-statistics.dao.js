const db = require("../config/db");

async function getMovieStatusStatsByUserId(userId) {
  const res = await db.query(
    `SELECT 
      status,
      COUNT(*) as count
    FROM user_movie_progress
    WHERE user_id = $1
      AND status IN ('plan_to_watch', 'completed')
    GROUP BY status`,
    [userId],
  );
  return res.rows;
}

async function getSeriesStatusStatsByUserId(userId) {
  const res = await db.query(
    `SELECT 
      status,
      COUNT(*) as count
    FROM user_series_progress
    WHERE user_id = $1
      AND status IN ('plan_to_watch', 'watching', 'completed')
    GROUP BY status`,
    [userId],
  );
  return res.rows;
}

async function getMovieTopGenresByUserId(userId) {
  const res = await db.query(
    `SELECT 
      g->>'name' as genre,
      COUNT(*) as count
    FROM user_movie_progress ump
    JOIN movie_cache mc ON mc.id = ump.movie_id
    CROSS JOIN jsonb_array_elements(mc.genres) as g
    WHERE ump.user_id = $1
      AND ump.status = 'completed'
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 3`,
    [userId],
  );
  return res.rows;
}

async function getSeriesTopGenresByUserId(userId) {
  const res = await db.query(
    `SELECT 
      g->>'name' as genre,
      COUNT(*) as count
    FROM user_series_progress usp
    JOIN series_cache sc ON sc.id = usp.series_id
    CROSS JOIN jsonb_array_elements(sc.genres) as g
    WHERE usp.user_id = $1
      AND usp.status = 'completed'
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 3`,
    [userId],
  );
  return res.rows;
}

module.exports = {
  getMovieStatusStatsByUserId,
  getSeriesStatusStatsByUserId,
  getMovieTopGenresByUserId,
  getSeriesTopGenresByUserId,
};
