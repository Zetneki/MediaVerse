const questsDao = require("../dao/quests.dao");
const userDao = require("../dao/users.dao");
const blockchainService = require("./blockchain.service");
const { AppError } = require("../middlewares/error-handler.middleware");

//QUEST INITIALIZATION

/**
 * Initialize quests for new user (first login after wallet connect)
 * @param {number} userId
 */
async function initializeUserQuests(userId) {
  //Check if user already has quests
  const existingQuests = await questsDao.getUserQuests(userId);
  if (existingQuests.length > 0) {
    return;
  }

  //Get all active quests
  const availableQuests = await questsDao.getActiveQuests();

  if (availableQuests.length < 2) {
    throw AppError.internal("Not enough active quests in pool");
  }

  //Random shuffle
  const shuffled = availableQuests.sort(() => 0.5 - Math.random());

  //Create 2 random quests
  await questsDao.createQuestSlot(
    userId,
    1,
    shuffled[0].id,
    shuffled[0].requirement_count,
  );
  await questsDao.createQuestSlot(
    userId,
    2,
    shuffled[1].id,
    shuffled[1].requirement_count,
  );
}

//GET USER QUESTS

/**
 * Get user's quests with cooldown status
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function getUserQuestsWithCooldown(userId) {
  //Initialize quests if not exists
  await initializeUserQuests(userId);

  //Get user quests
  const quests = await questsDao.getUserQuests(userId);

  //Get cooldown status
  const cooldownStatus = await questsDao.canUserReroll(userId);

  return {
    quests,
    canReroll: cooldownStatus.canReroll,
    nextRerollIn: cooldownStatus.nextAvailableIn,
  };
}

//REROLL QUEST SLOT

/**
 * Reroll a quest slot (shared 24h cooldown)
 * @param {number} userId
 * @param {number} slotNumber - 1 or 2
 * @returns {Promise<Object>} New quest
 */
async function rerollQuestSlot(userId, slotNumber) {
  //Validate slot number
  if (slotNumber !== 1 && slotNumber !== 2) {
    throw AppError.badRequest("Invalid slot number. Must be 1 or 2");
  }

  //Check cooldown (SHARED between slots!)
  const cooldownStatus = await questsDao.canUserReroll(userId);
  if (!cooldownStatus.canReroll) {
    throw AppError.badRequest(
      `Reroll on cooldown. Available in ${cooldownStatus.nextAvailableIn} hour(s)`,
    );
  }

  //Get available quests (exclude current quests)
  const availableQuests = await questsDao.getActiveQuests();
  const currentQuests = await questsDao.getUserQuests(userId);
  const currentQuestIds = currentQuests.map((q) => q.quest_id);

  //Filter out current quests
  const eligibleQuests = availableQuests.filter(
    (q) => !currentQuestIds.includes(q.id),
  );

  if (eligibleQuests.length === 0) {
    throw AppError.badRequest("No other quests available to reroll");
  }

  //Pick random quest
  const randomQuest =
    eligibleQuests[Math.floor(Math.random() * eligibleQuests.length)];

  //Delete old quest slot (+ content tracking via CASCADE)
  await questsDao.deleteQuestSlot(userId, slotNumber);

  //Create new quest slot
  const newQuest = await questsDao.createQuestSlot(
    userId,
    slotNumber,
    randomQuest.id,
    randomQuest.requirement_count,
  );

  //Update cooldown (SHARED - affects both slots)
  await questsDao.updateRerollCooldown(userId);

  return newQuest;
}

//CLAIM QUEST REWARD

/**
 * Claim quest reward (mint tokens + generate new quest)
 * @param {number} userId
 * @param {number} slotNumber
 * @returns {Promise<Object>} { txHash, newQuest }
 */
async function claimQuestReward(userId, slotNumber) {
  //Get quest slot
  const questSlot = await questsDao.getQuestSlot(userId, slotNumber);

  if (!questSlot) {
    throw AppError.notFound("Quest not found");
  }

  if (!questSlot.is_completed) {
    throw AppError.badRequest("Quest not completed yet");
  }

  if (questSlot.is_claimed) {
    throw AppError.badRequest("Quest reward already claimed");
  }

  //Get user (need wallet address)
  const user = await userDao.findById(userId);

  if (!user.wallet_address || !user.wallet_verified) {
    throw AppError.badRequest("Wallet not connected or verified");
  }

  //Reward user (blockchain)
  const txHash = await blockchainService.rewardUser(
    user.wallet_address,
    questSlot.reward_tokens,
  );

  //Mark as claimed
  await questsDao.markQuestClaimed(questSlot.id);

  //Delete claimed quest
  await questsDao.deleteQuestSlot(userId, slotNumber);

  //Get available quests + exclude current user quests
  const availableQuests = await questsDao.getActiveQuests();
  const currentQuests = await questsDao.getUserQuests(userId);
  const currentQuestIds = currentQuests.map((q) => q.quest_id);

  //Filter out quests user already has
  const eligibleQuests = availableQuests.filter(
    (q) => !currentQuestIds.includes(q.id),
  );

  if (eligibleQuests.length === 0) {
    throw AppError.internal("No eligible quests available");
  }

  //Pick random from eligible quests
  const randomQuest =
    eligibleQuests[Math.floor(Math.random() * eligibleQuests.length)];

  const newQuest = await questsDao.createQuestSlot(
    userId,
    slotNumber,
    randomQuest.id,
    randomQuest.requirement_count,
  );

  return { txHash, newQuest };
}

//QUEST PROGRESS CHECK (called from progress controllers)

/**
 * Check and increment quest progress
 * @param {number} userId
 * @param {string} actionType - 'add_to_plan', 'watch_episode', 'complete_movie', 'complete_series'
 * @param {string} contentType - 'movie', 'series'
 * @param {number} contentId
 * @param {string} episodeIds - Optional episode IDs for quests
 * @returns {Promise<Array<string>>} Array of completed quest names
 */
async function checkAndIncrementQuests(
  userId,
  actionType,
  contentType,
  contentId,
  episodeIds = [],
) {
  //Get user's active quests
  const quests = await questsDao.getUserQuests(userId);
  const completedQuests = [];

  for (const quest of quests) {
    if (quest.is_completed || quest.is_claimed) continue;
    if (quest.requirement_type !== actionType) continue;
    if (quest.content_type !== contentType && quest.content_type !== "any")
      continue;

    //Genre filter check
    if (quest.genre_filter && quest.genre_filter.length > 0) {
      const genreMatches = await checkGenreMatch(
        contentType,
        contentId,
        quest.genre_filter,
      );
      if (!genreMatches) continue;
    }

    if (
      quest.requirement_type === "watch_episode" &&
      episodeIds &&
      episodeIds.length > 0
    ) {
      //Insert episodes for quest
      const insertedCount = await questsDao.insertEpisodesForQuest(
        userId,
        quest.id,
        contentType,
        episodeIds,
      );

      //No new record added
      if (insertedCount === 0) continue;

      //Increment progress
      const updatedQuest = await questsDao.incrementProgress(
        quest.id,
        insertedCount,
      );

      //Check if quest completed
      if (updatedQuest.current_progress >= updatedQuest.required_progress) {
        await questsDao.markQuestCompleted(quest.id);
        completedQuests.push(quest.title);
      }
    } else {
      //Etcetera types (add_to_plan, complete_series, complete_movie)
      const uniqueContentId = contentId.toString();

      const alreadyCounted = await questsDao.isContentCounted(
        quest.id,
        uniqueContentId,
      );
      if (alreadyCounted) continue;

      await questsDao.addContentToQuest(
        userId,
        quest.id,
        contentType,
        uniqueContentId,
      );

      const updatedQuest = await questsDao.incrementProgress(quest.id, 1);

      if (updatedQuest.current_progress >= updatedQuest.required_progress) {
        await questsDao.markQuestCompleted(quest.id);
        completedQuests.push(quest.title);
      }
    }
  }

  return completedQuests;
}

/**
 * Check if content matches genre filter
 * @param {string} contentType - 'movie' or 'series'
 * @param {number} contentId
 * @param {Array<string>} genreFilter - ['28', '10765']
 * @returns {Promise<boolean>}
 */
async function checkGenreMatch(contentType, contentId, genreFilter) {
  //Get genres from DAO
  const genres = await questsDao.getContentGenres(contentType, contentId);

  //No genres found or invalid content type
  if (!genres || genres.length === 0) {
    return false;
  }

  //genres is JSONB: [{ id: 28, name: "Action" }, ...]
  const contentGenreIds = genres.map((g) => g.id.toString());

  //Check if content has ANY of the required genres
  return genreFilter.some((genreId) =>
    contentGenreIds.includes(genreId.toString()),
  );
}

module.exports = {
  getUserQuestsWithCooldown,
  rerollQuestSlot,
  claimQuestReward,
  checkAndIncrementQuests,
};
