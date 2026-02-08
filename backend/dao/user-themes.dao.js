const db = require("../config/db");

async function getUserThemes(userId) {
  const res = await db.query(`SELECT * FROM user_themes WHERE user_id = $1`, [
    userId,
  ]);
  return res.rows;
}

async function buyTheme(userId, theme) {
  const res = await db.query(
    `INSERT INTO user_themes (user_id, name) VALUES ($1, $2) RETURNING *`,
    [userId, theme],
  );
  return res.rows[0];
}

module.exports = {
  getUserThemes,
  buyTheme,
};
