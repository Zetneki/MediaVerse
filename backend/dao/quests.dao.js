const db = require("../config/db");

//Quest definitions

/**
 * Get all active quest definitions
 * @returns {Promise<Array>}
 */
async function getActiveQuests() {
  const res = await db.query(
    "SELECT * FROM quest_definitions WHERE is_active = true ORDER BY id",
  );
  return res.rows;
}

/**
 * Get quest definition by ID
 * @param {number} questId
 * @returns {Promise<Object>}
 */
async function getQuestById(questId) {
  const res = await db.query("SELECT * FROM quest_definitions WHERE id = $1", [
    questId,
  ]);
  return res.rows[0];
}

//USER QUEST SLOTS (active quests)

/**
 * Get user's active quests (both slots)
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function getUserQuests(userId) {
  const res = await db.query(
    `SELECT 
      uqs.id,
      uqs.user_id,
      uqs.slot_number,
      uqs.quest_id,
      uqs.current_progress,
      uqs.required_progress,
      uqs.is_completed,
      uqs.is_claimed,
      uqs.started_at,
      uqs.completed_at,
      uqs.claimed_at,
      qd.title,
      qd.description,
      qd.requirement_type,
      qd.requirement_count,
      qd.content_type,
      qd.genre_filter,
      qd.reward_tokens
     FROM user_quest_slots uqs
     JOIN quest_definitions qd ON uqs.quest_id = qd.id
     WHERE uqs.user_id = $1
     ORDER BY uqs.slot_number`,
    [userId],
  );
  return res.rows;
}

/**
 * Get specific quest slot
 * @param {number} userId
 * @param {number} slotNumber
 * @returns {Promise<Object>}
 */
async function getQuestSlot(userId, slotNumber) {
  const res = await db.query(
    `SELECT 
      uqs.*,
      qd.title,
      qd.description,
      qd.requirement_type,
      qd.content_type,
      qd.genre_filter,
      qd.reward_tokens
     FROM user_quest_slots uqs
     JOIN quest_definitions qd ON uqs.quest_id = qd.id
     WHERE uqs.user_id = $1 AND uqs.slot_number = $2`,
    [userId, slotNumber],
  );
  return res.rows[0];
}

/**
 * Create or replace quest in slot
 * @param {number} userId
 * @param {number} slotNumber
 * @param {number} questId
 * @param {number} requiredProgress
 * @returns {Promise<Object>}
 */
async function createQuestSlot(userId, slotNumber, questId, requiredProgress) {
  const res = await db.query(
    `INSERT INTO user_quest_slots 
     (user_id, slot_number, quest_id, required_progress)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, slot_number) 
     DO UPDATE SET 
       quest_id = $3,
       required_progress = $4,
       current_progress = 0,
       is_completed = false,
       is_claimed = false,
       started_at = NOW(),
       completed_at = NULL,
       claimed_at = NULL
     RETURNING *`,
    [userId, slotNumber, questId, requiredProgress],
  );
  return res.rows[0];
}

/**
 * Delete quest slot
 * @param {number} userId
 * @param {number} slotNumber
 */
async function deleteQuestSlot(userId, slotNumber) {
  await db.query(
    "DELETE FROM user_quest_slots WHERE user_id = $1 AND slot_number = $2",
    [userId, slotNumber],
  );
}

/**
 * Increment quest progress
 * @param {number} questSlotId
 * @param {number} amount
 * @returns {Promise<Object>}
 */
async function incrementProgress(questSlotId, amount) {
  const res = await db.query(
    `UPDATE user_quest_slots 
     SET current_progress = current_progress + $1
     WHERE id = $2
     RETURNING *`,
    [amount, questSlotId],
  );
  return res.rows[0];
}

/**
 * Mark quest as completed
 * @param {number} questSlotId
 * @returns {Promise<Object>}
 */
async function markQuestCompleted(questSlotId) {
  const res = await db.query(
    `UPDATE user_quest_slots 
     SET is_completed = true, completed_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [questSlotId],
  );
  return res.rows[0];
}

/**
 * Mark quest as claimed
 * @param {number} questSlotId
 * @returns {Promise<Object>}
 */
async function markQuestClaimed(questSlotId) {
  const res = await db.query(
    `UPDATE user_quest_slots 
     SET is_claimed = true, claimed_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [questSlotId],
  );
  return res.rows[0];
}

//QUEST CONTENT TRACKING (anti-cheat)

/**
 * Check if content already counted for quest
 * @param {number} questSlotId
 * @param {number} contentId
 * @returns {Promise<boolean>}
 */
async function isContentCounted(questSlotId, contentId) {
  const res = await db.query(
    `SELECT EXISTS(
      SELECT 1 FROM user_quest_content 
      WHERE quest_slot_id = $1 AND content_id = $2
    ) as exists`,
    [questSlotId, contentId],
  );
  return res.rows[0].exists;
}

/**
 * Add content to quest tracking
 * @param {number} userId
 * @param {number} questSlotId
 * @param {string} contentType - 'movie' or 'series'
 * @param {number} contentId
 */
async function addContentToQuest(userId, questSlotId, contentType, contentId) {
  await db.query(
    `INSERT INTO user_quest_content 
     (user_id, quest_slot_id, content_type, content_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (quest_slot_id, content_id) DO NOTHING`,
    [userId, questSlotId, contentType, contentId],
  );
}

/**
 * Insert multiple episodes for a quest, skipping duplicates
 * @param {number} userId
 * @param {number} questSlotId
 * @param {string} contentType
 * @param {string[]} episodeIds - Array of episode IDs like ['123_S1E1', '123_S1E2', ...]
 * @returns {Promise<number>} - Number of newly inserted episodes
 */
async function insertEpisodesForQuest(
  userId,
  questSlotId,
  contentType,
  episodeIds,
) {
  if (!episodeIds.length) return 0;

  const placeholders = episodeIds
    .map((_, i) => `($1, $2, $3, $${i + 4})`)
    .join(",");

  const values = [userId, questSlotId, contentType, ...episodeIds];

  const query = `
    INSERT INTO user_quest_content (user_id, quest_slot_id, content_type, content_id)
    VALUES ${placeholders}
    ON CONFLICT (quest_slot_id, content_id) DO NOTHING
    RETURNING id;
  `;

  const result = await db.query(query, values);
  return result.rowCount;
}

//REROLL COOLDOWN

/**
 * Get user's reroll cooldown
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
async function getRerollCooldown(userId) {
  const res = await db.query(
    "SELECT * FROM user_quest_reroll_cooldown WHERE user_id = $1",
    [userId],
  );
  return res.rows[0] || null;
}

/**
 * Update reroll cooldown (upsert)
 * @param {number} userId
 */
async function updateRerollCooldown(userId) {
  await db.query(
    `INSERT INTO user_quest_reroll_cooldown 
     (user_id, last_reroll_at, next_reroll_available_at)
     VALUES ($1, NOW(), NOW() + INTERVAL '24 hours')
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       last_reroll_at = NOW(), 
       next_reroll_available_at = NOW() + INTERVAL '24 hours'`,
    [userId],
  );
}

/**
 * Check if user can reroll
 * @param {number} userId
 * @returns {Promise<Object>} { canReroll: boolean, nextAvailableIn: number (hours) }
 */
async function canUserReroll(userId) {
  const cooldown = await getRerollCooldown(userId);

  if (!cooldown) {
    return { canReroll: true, nextAvailableIn: 0 };
  }

  const now = new Date();
  const nextAvailable = new Date(cooldown.next_reroll_available_at);

  if (now >= nextAvailable) {
    return { canReroll: true, nextAvailableIn: 0 };
  }

  const msRemaining = nextAvailable - now;
  const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60));

  return { canReroll: false, nextAvailableIn: hoursRemaining };
}

/**
 * Get movie genres by ID
 * @param {number} movieId
 * @returns {Promise<Array<Object>|null>} Genres array or null
 */
async function getMovieGenres(movieId) {
  const res = await db.query("SELECT genres FROM movie_cache WHERE id = $1", [
    movieId,
  ]);

  if (!res.rows[0] || !res.rows[0].genres) {
    return null;
  }

  return res.rows[0].genres;
}

/**
 * Get series genres by ID
 * @param {number} seriesId
 * @returns {Promise<Array<Object>|null>} Genres array or null
 */
async function getSeriesGenres(seriesId) {
  const res = await db.query("SELECT genres FROM series_cache WHERE id = $1", [
    seriesId,
  ]);

  if (!res.rows[0] || !res.rows[0].genres) {
    return null;
  }

  return res.rows[0].genres;
}

/**
 * Get content genres (movie or series)
 * @param {string} contentType - 'movie' or 'series'
 * @param {number} contentId
 * @returns {Promise<Array<Object>|null>} Genres array or null
 */
async function getContentGenres(contentType, contentId) {
  if (contentType === "movie") {
    return getMovieGenres(contentId);
  } else if (contentType === "series") {
    return getSeriesGenres(contentId);
  }

  return null;
}

module.exports = {
  //Quest definitions
  getActiveQuests,
  getQuestById,

  //User quest slots
  getUserQuests,
  getQuestSlot,
  createQuestSlot,
  deleteQuestSlot,
  incrementProgress,
  markQuestCompleted,
  markQuestClaimed,

  //Content tracking
  isContentCounted,
  addContentToQuest,
  insertEpisodesForQuest,
  getContentGenres,

  //Reroll cooldown
  getRerollCooldown,
  updateRerollCooldown,
  canUserReroll,
};
