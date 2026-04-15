const db = require("../config/db");

async function geLast7DaysActivityByUserdId(userId) {
  const res = await db.query(
    `SELECT activity_date, activity_count 
    FROM user_activity 
    WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '6 days'
    ORDER BY activity_date ASC`,
    [userId],
  );
  return res.rows;
}

async function upsertUserActivity(userId) {
  const res = await db.query(
    `INSERT INTO user_activity (user_id, activity_date, activity_count)
    VALUES ($1, CURRENT_DATE, 1)
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
      activity_count = user_activity.activity_count + 1
    RETURNING *`,
    [userId],
  );
  return res.rows[0];
}

async function deleteOldUserActivity() {
  const res = await db.query(`
    DELETE FROM user_activity 
    WHERE activity_date < CURRENT_DATE - INTERVAL '6 days'
  `);

  return res.rowCount;
}

module.exports = {
  geLast7DaysActivityByUserdId,
  upsertUserActivity,
  deleteOldUserActivity,
};
