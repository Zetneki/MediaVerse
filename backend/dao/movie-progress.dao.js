const db = require("../config/db");

async function getUserMoviesWithDetails(userId) {
  const res = await db.query(
    `
    SELECT 
      m.id,
      m.title,
      m.poster_path,
      p.status,
      p.last_watched
    FROM user_movie_progress p
    JOIN movie_cache m ON m.id = p.movie_id
    WHERE p.user_id = $1
    ORDER BY p.last_watched DESC
    `,
    [userId],
  );

  return res.rows;
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
  getUserMoviesWithDetails,
  upsertMovieProgress,
  deleteMovieProgress,
};
