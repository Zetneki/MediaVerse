const db = require("../config/db");

async function getProgressByMovieId(userId, movieId) {
  const res = await db.query(
    `SELECT
    movie_id as id,
    status,
    last_watched
    FROM user_movie_progress 
    WHERE user_id = $1 AND movie_id = $2`,
    [userId, movieId],
  );
  return res.rows[0];
}

async function getMoviesWithDetails(
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
    conditions.push(`m.title ILIKE $${paramIndex}`);
    params.push(`%${filters.search.trim()}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  let orderByClause = "p.last_watched DESC";

  if (filters.sortBy) {
    const sortColumn =
      {
        last_watched: "p.last_watched",
        title: "m.title",
        status: "p.status",
      }[filters.sortBy] || "p.last_watched";

    const sortDirection = filters.sortOrder === "asc" ? "ASC" : "DESC";
    orderByClause = `${sortColumn} ${sortDirection}`;
  }

  params.push(limit, offset);

  const res = await db.query(
    `
    SELECT 
      m.id,
      m.title,
      m.poster_path,
      p.status,
      p.last_watched,
      m.genres,
      COUNT(*) OVER() as total_count
    FROM user_movie_progress p
    JOIN movie_cache m ON m.id = p.movie_id
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

async function upsertMovieProgress(userId, movieId, status) {
  const res = await db.query(
    `INSERT INTO user_movie_progress (user_id, movie_id, status, last_watched)
    VALUES ($1, $2, $3, NOW()) 
    ON CONFLICT (user_id, movie_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      last_watched = NOW()
    WHERE user_movie_progress.status != EXCLUDED.status
    RETURNING *, (xmax = 0) as inserted`,
    [userId, movieId, status],
  );
  return res.rows[0];
}

async function deleteMovieProgress(userId, movieId) {
  const res = await db.query(
    `DELETE FROM user_movie_progress WHERE user_id = $1 AND movie_id = $2 RETURNING *`,
    [userId, movieId],
  );
  return res.rows[0];
}

module.exports = {
  getProgressByMovieId,
  getMoviesWithDetails,
  upsertMovieProgress,
  deleteMovieProgress,
};
