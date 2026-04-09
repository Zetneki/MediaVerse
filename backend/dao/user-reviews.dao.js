const db = require("../config/db");

async function doesContentExist(contentId, contentType) {
  const res = await db.query(
    `SELECT EXISTS(
      SELECT 1 FROM ${contentType}_cache 
      WHERE id = $1
    ) as exists`,
    [contentId],
  );
  return res.rows[0].exists;
}

async function getUserReviewByContent(userId, contentId, contentType) {
  const res = await db.query(
    `SELECT score, review FROM user_reviews 
     WHERE user_id = $1 AND content_id = $2 AND content_type = $3`,
    [userId, contentId, contentType],
  );
  return res.rows[0];
}

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

async function getUserReviews(userId, page, limit = 20, search = "") {
  const conditions = ["r.user_id = $1"];
  const params = [userId];
  let paramIndex = 2;

  if (search && search.trim() !== "") {
    conditions.push(`
      (mc.title ILIKE $${paramIndex} OR sc.name ILIKE $${paramIndex})
    `);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  params.push(limit, (page - 1) * limit);

  const res = await db.query(
    `
    SELECT 
      r.score,
      r.review,
      r.reviewed_at,
      r.content_type,
      CASE
        WHEN r.content_type = 'movie' THEN mc.title
        WHEN r.content_type = 'series' THEN sc.name
      END as content_title,
      r.content_id,
      COUNT(*) OVER() AS total_count
    FROM user_reviews r
    LEFT JOIN movie_cache mc ON mc.id = r.content_id AND r.content_type = 'movie'
    LEFT JOIN series_cache sc ON sc.id = r.content_id AND r.content_type = 'series'
    WHERE ${conditions.join(" AND ")}
    ORDER BY r.reviewed_at DESC 
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
    RETURNING *, 
      (xmax = 0) as inserted
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
  doesContentExist,
  getReviewsByContent,
  getUserReviewByContent,
  getUserReviews,
  upsertReview,
  deleteReview,
};
