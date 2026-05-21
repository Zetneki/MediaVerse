/**
 * quests.service.test.js
 *
 * Unit tests for quests.service.js
 * All external dependencies are mocked – no DB or blockchain connection required.
 *
 * Run: npx jest quests.service.test.js --verbose
 */

const questsService = require("../services/quests.service");
const questsDao = require("../dao/quests.dao");
const userDao = require("../dao/users.dao");
const blockchainService = require("../services/blockchain.service");
const { upsertUserActivity } = require("../dao/user-activity.dao");

// ---------------------------------------------------------------------------
// Mock all external dependencies
// ---------------------------------------------------------------------------
jest.mock("../services/blockchain.service", () => ({
  rewardUser: jest.fn(),
  purchaseThemeForUser: jest.fn(),
  hasTheme: jest.fn(),
}));

jest.mock("../dao/quests.dao");
jest.mock("../dao/users.dao");
jest.mock("../dao/user-activity.dao");

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------
const MOCK_USER = {
  id: 1,
  username: "testuser",
  wallet_address: "0xABC123",
  wallet_verified: true,
};

const MOCK_USER_NO_WALLET = {
  id: 2,
  username: "nowallet",
  wallet_address: null,
  wallet_verified: false,
};

const MOCK_QUEST_SLOT = {
  id: 10,
  user_id: 1,
  slot_number: 1,
  quest_id: 5,
  current_progress: 3,
  required_progress: 3,
  is_completed: true,
  is_claimed: false,
  reward_tokens: 100,
  title: "Watch 3 movies",
  requirement_type: "complete_movie",
  content_type: "movie",
};

const MOCK_ACTIVE_QUESTS = [
  { id: 1, title: "Quest A", requirement_count: 3 },
  { id: 2, title: "Quest B", requirement_count: 5 },
  { id: 3, title: "Quest C", requirement_count: 2 },
];

// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  upsertUserActivity.mockResolvedValue();
});

// ===========================================================================
// getUserQuestsWithCooldown
// ===========================================================================
describe("getUserQuestsWithCooldown", () => {
  test("returns quests and cooldown status when quests already exist", async () => {
    questsDao.getUserQuests.mockResolvedValue([MOCK_QUEST_SLOT]);
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });

    const result = await questsService.getUserQuestsWithCooldown(1);

    expect(result.quests).toHaveLength(1);
    expect(result.canReroll).toBe(true);
    expect(result.nextRerollIn).toBe(0);
  });

  test("initializes quests when user has none", async () => {
    questsDao.getUserQuests
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([MOCK_QUEST_SLOT]);
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.createQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });

    const result = await questsService.getUserQuestsWithCooldown(1);

    expect(questsDao.createQuestSlot).toHaveBeenCalledTimes(2);
    expect(result.quests).toBeDefined();
  });

  test("returns canReroll false with hours remaining when on cooldown", async () => {
    questsDao.getUserQuests.mockResolvedValue([MOCK_QUEST_SLOT]);
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: false,
      nextAvailableIn: 12,
    });

    const result = await questsService.getUserQuestsWithCooldown(1);

    expect(result.canReroll).toBe(false);
    expect(result.nextRerollIn).toBe(12);
  });
});

// ===========================================================================
// rerollQuestSlot
// ===========================================================================
describe("rerollQuestSlot", () => {
  test("rerolls slot successfully and returns new quest", async () => {
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.getUserQuests.mockResolvedValue([
      { ...MOCK_QUEST_SLOT, quest_id: 1 },
    ]);
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.createQuestSlot.mockResolvedValue({
      ...MOCK_QUEST_SLOT,
      quest_id: 2,
    });
    questsDao.updateRerollCooldown.mockResolvedValue();

    const result = await questsService.rerollQuestSlot(1, 1);

    expect(questsDao.deleteQuestSlot).toHaveBeenCalledWith(1, 1);
    expect(questsDao.createQuestSlot).toHaveBeenCalled();
    expect(questsDao.updateRerollCooldown).toHaveBeenCalledWith(1);
    expect(result).toBeDefined();
  });

  test("throws bad request for invalid slot number (0)", async () => {
    await expect(questsService.rerollQuestSlot(1, 0)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(questsDao.canUserReroll).not.toHaveBeenCalled();
  });

  test("throws bad request for invalid slot number (3)", async () => {
    await expect(questsService.rerollQuestSlot(1, 3)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws bad request when reroll is on cooldown", async () => {
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: false,
      nextAvailableIn: 8,
    });

    await expect(questsService.rerollQuestSlot(1, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(questsDao.deleteQuestSlot).not.toHaveBeenCalled();
  });

  test("throws bad request when no other quests available", async () => {
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });
    questsDao.getActiveQuests.mockResolvedValue([
      { id: 1, title: "Quest A", requirement_count: 3 },
      { id: 2, title: "Quest B", requirement_count: 5 },
    ]);
    // User already has both available quests
    questsDao.getUserQuests.mockResolvedValue([
      { ...MOCK_QUEST_SLOT, quest_id: 1 },
      { ...MOCK_QUEST_SLOT, quest_id: 2, slot_number: 2 },
    ]);

    await expect(questsService.rerollQuestSlot(1, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(questsDao.deleteQuestSlot).not.toHaveBeenCalled();
  });

  test("new quest is different from current quests", async () => {
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    const currentQuests = [{ ...MOCK_QUEST_SLOT, quest_id: 1 }];
    questsDao.getUserQuests.mockResolvedValue(currentQuests);
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.createQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    questsDao.updateRerollCooldown.mockResolvedValue();

    await questsService.rerollQuestSlot(1, 1);

    const createCall = questsDao.createQuestSlot.mock.calls[0];
    const newQuestId = createCall[2];
    expect(newQuestId).not.toBe(1); // must not be same as current quest_id
  });

  test("updates cooldown after successful reroll", async () => {
    questsDao.canUserReroll.mockResolvedValue({
      canReroll: true,
      nextAvailableIn: 0,
    });
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.getUserQuests.mockResolvedValue([
      { ...MOCK_QUEST_SLOT, quest_id: 1 },
    ]);
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.createQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    questsDao.updateRerollCooldown.mockResolvedValue();

    await questsService.rerollQuestSlot(1, 1);

    expect(questsDao.updateRerollCooldown).toHaveBeenCalledWith(1);
  });
});

// ===========================================================================
// claimQuestReward
// ===========================================================================
describe("claimQuestReward", () => {
  test("claims reward successfully – rewards user and generates new quest", async () => {
    questsDao.getQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    userDao.findById.mockResolvedValue(MOCK_USER);
    blockchainService.rewardUser.mockResolvedValue("0xTXHASH");
    questsDao.markQuestClaimed.mockResolvedValue();
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.getUserQuests.mockResolvedValue([]);
    questsDao.createQuestSlot.mockResolvedValue({ ...MOCK_QUEST_SLOT, id: 99 });

    const result = await questsService.claimQuestReward(1, 1);

    expect(blockchainService.rewardUser).toHaveBeenCalledWith(
      MOCK_USER.wallet_address,
      MOCK_QUEST_SLOT.reward_tokens,
    );
    expect(questsDao.markQuestClaimed).toHaveBeenCalledWith(MOCK_QUEST_SLOT.id);
    expect(questsDao.deleteQuestSlot).toHaveBeenCalledWith(1, 1);
    expect(result.txHash).toBe("0xTXHASH");
    expect(result.newQuest).toBeDefined();
  });

  test("throws not found when quest slot does not exist", async () => {
    questsDao.getQuestSlot.mockResolvedValue(null);

    await expect(questsService.claimQuestReward(1, 1)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(blockchainService.rewardUser).not.toHaveBeenCalled();
  });

  test("throws bad request when quest is not completed yet", async () => {
    questsDao.getQuestSlot.mockResolvedValue({
      ...MOCK_QUEST_SLOT,
      is_completed: false,
    });

    await expect(questsService.claimQuestReward(1, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(blockchainService.rewardUser).not.toHaveBeenCalled();
  });

  test("throws bad request when reward already claimed", async () => {
    questsDao.getQuestSlot.mockResolvedValue({
      ...MOCK_QUEST_SLOT,
      is_claimed: true,
    });

    await expect(questsService.claimQuestReward(1, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(blockchainService.rewardUser).not.toHaveBeenCalled();
  });

  test("throws bad request when user wallet is not connected", async () => {
    questsDao.getQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    userDao.findById.mockResolvedValue(MOCK_USER_NO_WALLET);

    await expect(questsService.claimQuestReward(1, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(blockchainService.rewardUser).not.toHaveBeenCalled();
  });

  test("calls rewardUser with correct wallet address and token amount", async () => {
    questsDao.getQuestSlot.mockResolvedValue({
      ...MOCK_QUEST_SLOT,
      reward_tokens: 250,
    });
    userDao.findById.mockResolvedValue({
      ...MOCK_USER,
      wallet_address: "0xDEAD",
    });
    blockchainService.rewardUser.mockResolvedValue("0xHASH");
    questsDao.markQuestClaimed.mockResolvedValue();
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.getUserQuests.mockResolvedValue([]);
    questsDao.createQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);

    await questsService.claimQuestReward(1, 1);

    expect(blockchainService.rewardUser).toHaveBeenCalledWith("0xDEAD", 250);
  });

  test("generates a new quest after claiming", async () => {
    questsDao.getQuestSlot.mockResolvedValue(MOCK_QUEST_SLOT);
    userDao.findById.mockResolvedValue(MOCK_USER);
    blockchainService.rewardUser.mockResolvedValue("0xTX");
    questsDao.markQuestClaimed.mockResolvedValue();
    questsDao.deleteQuestSlot.mockResolvedValue();
    questsDao.getActiveQuests.mockResolvedValue(MOCK_ACTIVE_QUESTS);
    questsDao.getUserQuests.mockResolvedValue([]);
    const newQuest = { ...MOCK_QUEST_SLOT, id: 55, quest_id: 3 };
    questsDao.createQuestSlot.mockResolvedValue(newQuest);

    const result = await questsService.claimQuestReward(1, 1);

    expect(questsDao.createQuestSlot).toHaveBeenCalled();
    expect(result.newQuest).toEqual(newQuest);
  });
});

// ===========================================================================
// checkAndIncrementQuests
// ===========================================================================
describe("checkAndIncrementQuests", () => {
  const INCOMPLETE_QUEST = {
    id: 10,
    quest_id: 5,
    is_completed: false,
    is_claimed: false,
    requirement_type: "complete_movie",
    content_type: "movie",
    genre_filter: [],
    title: "Watch 3 movies",
  };

  test("increments progress and returns completed quest name when threshold reached", async () => {
    questsDao.getUserQuests.mockResolvedValue([INCOMPLETE_QUEST]);
    questsDao.isContentCounted.mockResolvedValue(false);
    questsDao.addContentToQuest.mockResolvedValue();
    questsDao.incrementProgress.mockResolvedValue({
      current_progress: 3,
      required_progress: 3,
    });
    questsDao.markQuestCompleted.mockResolvedValue();

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.incrementProgress).toHaveBeenCalledWith(
      INCOMPLETE_QUEST.id,
      1,
    );
    expect(questsDao.markQuestCompleted).toHaveBeenCalledWith(
      INCOMPLETE_QUEST.id,
    );
    expect(result).toContain("Watch 3 movies");
  });

  test("does not mark completed when progress below threshold", async () => {
    questsDao.getUserQuests.mockResolvedValue([INCOMPLETE_QUEST]);
    questsDao.isContentCounted.mockResolvedValue(false);
    questsDao.addContentToQuest.mockResolvedValue();
    questsDao.incrementProgress.mockResolvedValue({
      current_progress: 1,
      required_progress: 3,
    });

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.markQuestCompleted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips already completed quests", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, is_completed: true },
    ]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.isContentCounted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips already claimed quests", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, is_claimed: true },
    ]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.isContentCounted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips quests with non-matching action type", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, requirement_type: "add_to_plan" },
    ]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.isContentCounted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips quests with non-matching content type", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, content_type: "series" },
    ]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.isContentCounted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("accepts quest with content_type any", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, content_type: "any" },
    ]);
    questsDao.isContentCounted.mockResolvedValue(false);
    questsDao.addContentToQuest.mockResolvedValue();
    questsDao.incrementProgress.mockResolvedValue({
      current_progress: 1,
      required_progress: 3,
    });

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.incrementProgress).toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips content already counted for quest (anti-cheat)", async () => {
    questsDao.getUserQuests.mockResolvedValue([INCOMPLETE_QUEST]);
    questsDao.isContentCounted.mockResolvedValue(true);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.incrementProgress).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("skips quest when genre filter does not match", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, genre_filter: ["28"] },
    ]);
    questsDao.getContentGenres.mockResolvedValue([{ id: 18, name: "Drama" }]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.isContentCounted).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  test("processes quest when genre filter matches", async () => {
    questsDao.getUserQuests.mockResolvedValue([
      { ...INCOMPLETE_QUEST, genre_filter: ["28"] },
    ]);
    questsDao.getContentGenres.mockResolvedValue([{ id: 28, name: "Action" }]);
    questsDao.isContentCounted.mockResolvedValue(false);
    questsDao.addContentToQuest.mockResolvedValue();
    questsDao.incrementProgress.mockResolvedValue({
      current_progress: 1,
      required_progress: 3,
    });

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(questsDao.incrementProgress).toHaveBeenCalled();
  });

  test("returns empty array when user has no quests", async () => {
    questsDao.getUserQuests.mockResolvedValue([]);

    const result = await questsService.checkAndIncrementQuests(
      1,
      "complete_movie",
      "movie",
      550,
    );

    expect(result).toEqual([]);
  });
});
