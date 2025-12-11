const pool = require("../config/db");

async function upsertGenreCache(source, genre) {
  const query = `
    INSERT INTO genre_cache (source, id, name, last_updated)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (source, id) DO UPDATE SET
      name = EXCLUDED.name,
      last_updated = NOW()
    RETURNING *;
  `;
  const values = [source, genre.id, genre.name];
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

module.exports = {
  upsertGenreCache,
  getGenresBySource,
};
