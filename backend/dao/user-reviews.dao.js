const db = require("../config/db");

async function getReviewsByContent(contentId, contentType, page, limit = 20) {
  const res = await db.query(
    `
    SELECT 
      r.score,
      r.review,
      r.reviewed_at,
      p.username,
      COUNT(*) OVER() AS total_count
    FROM user_reviews r
    LEFT JOIN user_profile p ON p.id = r.user_id 
    WHERE r.content_id = $1 AND r.content_type = $2
    ORDER BY r.reviewed_at DESC 
    LIMIT $3 OFFSET $4
    `,
    [contentId, contentType, limit, (page - 1) * limit],
  );

  return {
    reviews: res.rows,
    total: res.rows[0]?.total_count ?? 0,
  };
}

async function getUserReviews(userId, page, limit = 20) {
  const res = await db.query(
    `
    SELECT 
    r.score,
    r.review,
    r.reviewed_at,
    CASE
      WHEN r.content_type = 'movie' THEN mc.title
      WHEN r.content_type = 'series' THEN sc.name
    END as content_title
    FROM user_reviews r
    LEFT JOIN movie_cache mc ON mc.id = r.content_id AND r.content_type = 'movie'
    LEFT JOIN series_cache sc ON sc.id = r.content_id AND r.content_type = 'series'
    WHERE r.user_id = $1 
    ORDER BY r.reviewed_at DESC 
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, (page - 1) * limit],
  );

  return res.rows;
}

async function upsertReview(userId, contentId, contentType, score, review) {
  const res = await db.query(
    `
    INSERT INTO 
    user_reviews (user_id, content_id, content_type, score, review)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, content_id, content_type) 
    DO UPDATE SET
      score = EXCLUDED.score,
      review = EXCLUDED.review,
      reviewed_at = NOW()
    RETURNING *
    `,
    [userId, contentId, contentType, score, review],
  );

  return res.rows[0];
}

async function deleteReview(userId, contentId, contentType) {
  const res = await db.query(
    `
    DELETE FROM user_reviews 
    WHERE user_id = $1 AND content_id = $2 AND content_type = $3
    RETURNING *
    `,
    [userId, contentId, contentType],
  );

  return res.rows[0];
}

module.exports = {
  getReviewsByContent,
  getUserReviews,
  upsertReview,
  deleteReview,
};
