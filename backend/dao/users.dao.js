const db = require("../config/db");

async function createUser(username, passwordHash) {
  const res = await db.query(
    `INSERT INTO user_profile (username, password_hash)
    VALUES ($1, $2)
    RETURNING id, username`,
    [username, passwordHash],
  );
  return res.rows[0];
}

async function findByUsername(username) {
  const res = await db.query(`SELECT * FROM user_profile WHERE username = $1`, [
    username,
  ]);
  return res.rows[0];
}

async function findById(id) {
  const res = await db.query(`SELECT * FROM user_profile WHERE id = $1`, [id]);
  return res.rows[0];
}

async function activeMode(userId, modeName) {
  await db.query(
    `UPDATE user_profile SET active_dark_light_mode = $1 WHERE id = $2`,
    [modeName, userId],
  );
}

async function activeTheme(userId, themeName) {
  await db.query(`UPDATE user_profile SET active_theme = $1 WHERE id = $2`, [
    themeName,
    userId,
  ]);
}

async function updateUsername(userId, newUsername) {
  const res = await db.query(
    `UPDATE user_profile SET username = $1 where id = $2 RETURNING *`,
    [newUsername, userId],
  );
  return res.rows[0];
}

async function updatePassword(userId, newHash) {
  await db.query(`UPDATE user_profile SET password_hash = $1 WHERE id = $2`, [
    newHash,
    userId,
  ]);
}

async function deleteUser(userId) {
  const res = await db.query(`DELETE FROM user_profile WHERE id = $1`, [
    userId,
  ]);
  return res.rowCount;
}

async function incrementTokenVersion(userId) {
  await db.query(
    "UPDATE user_profile SET token_version = token_version + 1 WHERE id = $1",
    [userId],
  );
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  activeMode,
  activeTheme,
  updateUsername,
  updatePassword,
  deleteUser,
  incrementTokenVersion,
};
