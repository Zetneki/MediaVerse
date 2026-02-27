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

async function getSeriesWithDetails(
  userId,
  page = 1,
  limit = 20,
  filters = {},
) {
  const offset = (page - 1) * limit;
  const conditions = ["p.user_id = $1"];
  const params = [userId];
  let paramIndex = 2;

  if (filters.status) {
    conditions.push(`p.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.search && filters.search.trim() !== "") {
    conditions.push(`s.name ILIKE $${paramIndex}`);
    params.push(`%${filters.search.trim()}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  let orderByClause = "p.last_watched DESC";

  if (filters.sortBy) {
    const sortColumn =
      {
        last_watched: "p.last_watched",
        name: "s.name",
        status: "p.status",
      }[filters.sortBy] || "p.last_watched";

    const sortDirection = filters.sortOrder === "asc" ? "ASC" : "DESC";
    orderByClause = `${sortColumn} ${sortDirection}`;
  }

  params.push(limit, offset);

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
      s.genres,
      COUNT(*) OVER() as total_count
    FROM user_series_progress p
    JOIN series_cache s ON s.id = p.series_id
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
    params,
  );

  const items = res.rows;
  const totalCount = items.length > 0 ? parseInt(items[0].total_count) : 0;

  return {
    items: items.map((item) => {
      const { total_count, ...rest } = item;
      return rest;
    }),
    total: totalCount,
  };
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
