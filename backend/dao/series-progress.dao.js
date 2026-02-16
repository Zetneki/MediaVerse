const db = require("../config/db");

async function getProgressBySeriesId(userId, seriesId) {
  const res = await db.query(
    `
    SELECT
    s.id,
    status,
    p.last_watched,
    p.current_season,
    p.current_episode,
    s.seasons,
    s.total_seasons,
    s.total_episodes
    FROM user_series_progress p
    JOIN series_cache s ON s.id = p.series_id
    WHERE p.user_id = $1 AND p.series_id = $2`,
    [userId, seriesId],
  );
  return res.rows[0];
}

async function getSeriesWithDetails(userId) {
  const res = await db.query(
    `
    SELECT 
      s.id,
      s.name,
      s.poster_path,
      p.status,
      p.last_watched,
      p.current_season,
      p.current_episode,
      s.seasons,
      s.total_seasons,
      s.total_episodes,
      s.genres
    FROM user_series_progress p
    JOIN series_cache s ON s.id = p.series_id
    WHERE p.user_id = $1
    ORDER BY p.last_watched DESC
    `,
    [userId],
  );

  return res.rows;
}

async function upsertSeriesProgress(userId, seriesId, status, season, episode) {
  const res = await db.query(
    `INSERT INTO user_series_progress (user_id, series_id, status, last_watched, current_season, current_episode)
    VALUES ($1, $2, $3, NOW(), $4, $5) 
    ON CONFLICT (user_id, series_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      last_watched = NOW(),
      current_season = EXCLUDED.current_season,
      current_episode = EXCLUDED.current_episode
    WHERE user_series_progress.status != EXCLUDED.status
      OR user_series_progress.current_season != EXCLUDED.current_season
      OR user_series_progress.current_episode != EXCLUDED.current_episode
    RETURNING *, (xmax = 0) as inserted`,
    [userId, seriesId, status, season, episode],
  );
  return res.rows[0];
}

async function deleteSeriesProgress(userId, seriesId) {
  const res = await db.query(
    `DELETE FROM user_series_progress WHERE user_id = $1 AND series_id = $2 RETURNING *`,
    [userId, seriesId],
  );
  return res.rows[0];
}

module.exports = {
  getProgressBySeriesId,
  getSeriesWithDetails,
  upsertSeriesProgress,
  deleteSeriesProgress,
};
