/**
 * users.service.test.js
 *
 * Unit tests for users.service.js
 * All external dependencies (usersDao, passwordUtil, jwtUtil, userThemesService)
 * are mocked – no DB connection required.
 *
 * Run: npx jest users.service.test.js
 */

const usersService = require("../services/users.service");
const usersDao = require("../dao/users.dao");
const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const userThemesService = require("../services/user-themes.service");
const { AppError } = require("../middlewares/error-handler.middleware");

// ---------------------------------------------------------------------------
// Mock all external dependencies
// ---------------------------------------------------------------------------

// blockchain.service.js instantiates ethers.Wallet at module load time
// which requires a real private key – mock the entire module to prevent this
jest.mock("../services/blockchain.service", () => ({
  rewardUser: jest.fn(),
  purchaseThemeForUser: jest.fn(),
  hasTheme: jest.fn(),
}));

jest.mock("../dao/users.dao");
jest.mock("../utils/password.util");
jest.mock("../utils/jwt.util");
jest.mock("../services/user-themes.service");

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------
const MOCK_USER = {
  id: 1,
  username: "testuser",
  password_hash: "hashedpassword",
  token_version: 0,
  active_theme: "indigo",
  active_dark_light_mode: "system",
  wallet_address: null,
  wallet_verified: false,
  wallet_last_verified: null,
  created_at: new Date().toISOString(),
};

const SAFE_USER = (() => {
  const { password_hash, token_version, ...safe } = MOCK_USER;
  return safe;
})();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
});

// ===========================================================================
// register
// ===========================================================================
describe("register", () => {
  test("creates user with hashed password on valid input", async () => {
    passwordUtil.hashPassword.mockResolvedValue("hashed");
    usersDao.createUser.mockResolvedValue({ id: 1, username: "testuser" });

    await usersService.register("testuser", "Password1");

    expect(passwordUtil.hashPassword).toHaveBeenCalledWith("Password1");
    expect(usersDao.createUser).toHaveBeenCalledWith("testuser", "hashed");
  });

  test("throws validation error when password is too short", async () => {
    await expect(
      usersService.register("testuser", "Ab1"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(usersDao.createUser).not.toHaveBeenCalled();
  });

  test("throws validation error when password has no uppercase letter", async () => {
    await expect(
      usersService.register("testuser", "password1"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws validation error when password has no number", async () => {
    await expect(
      usersService.register("testuser", "Password"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws validation error when password equals username", async () => {
    await expect(
      usersService.register("testuser", "testuser"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws validation error when username is too short", async () => {
    await expect(
      usersService.register("ab", "Password1"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws conflict error when username already exists (DB 23505)", async () => {
    passwordUtil.hashPassword.mockResolvedValue("hashed");
    const dbError = new Error("duplicate");
    dbError.code = "23505";
    usersDao.createUser.mockRejectedValue(dbError);

    await expect(
      usersService.register("testuser", "Password1"),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("re-throws unknown DB errors", async () => {
    passwordUtil.hashPassword.mockResolvedValue("hashed");
    const unknownError = new Error("DB connection lost");
    usersDao.createUser.mockRejectedValue(unknownError);

    await expect(
      usersService.register("testuser", "Password1"),
    ).rejects.toThrow("DB connection lost");
  });
});

// ===========================================================================
// login
// ===========================================================================
describe("login", () => {
  test("returns user, accessToken and refreshToken on valid credentials", async () => {
    usersDao.findByUsername.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(true);
    jwtUtil.generateTokens.mockReturnValue({
      accessToken: "access123",
      refreshToken: "refresh123",
    });

    const result = await usersService.login("testuser", "Password1");

    expect(result.accessToken).toBe("access123");
    expect(result.refreshToken).toBe("refresh123");
    expect(result.user).not.toHaveProperty("password_hash");
    expect(result.user).not.toHaveProperty("token_version");
  });

  test("throws unauthorized when user does not exist", async () => {
    usersDao.findByUsername.mockResolvedValue(null);

    await expect(
      usersService.login("nobody", "Password1"),
    ).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(passwordUtil.comparePassword).not.toHaveBeenCalled();
  });

  test("throws unauthorized when password is incorrect", async () => {
    usersDao.findByUsername.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(false);

    await expect(
      usersService.login("testuser", "WrongPass1"),
    ).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(jwtUtil.generateTokens).not.toHaveBeenCalled();
  });

  test("calls generateTokens with the full user object", async () => {
    usersDao.findByUsername.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(true);
    jwtUtil.generateTokens.mockReturnValue({
      accessToken: "a",
      refreshToken: "r",
    });

    await usersService.login("testuser", "Password1");

    expect(jwtUtil.generateTokens).toHaveBeenCalledWith(MOCK_USER);
  });
});

// ===========================================================================
// logout
// ===========================================================================
describe("logout", () => {
  test("increments token version to invalidate tokens", async () => {
    usersDao.incrementTokenVersion.mockResolvedValue();

    await usersService.logout(1);

    expect(usersDao.incrementTokenVersion).toHaveBeenCalledWith(1);
  });
});

// ===========================================================================
// getUserById
// ===========================================================================
describe("getUserById", () => {
  test("returns user without sensitive fields", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);

    const result = await usersService.getUserById(1);

    expect(result).not.toHaveProperty("password_hash");
    expect(result).not.toHaveProperty("token_version");
    expect(result.username).toBe("testuser");
  });

  test("throws not found when user does not exist", async () => {
    usersDao.findById.mockResolvedValue(null);

    await expect(usersService.getUserById(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ===========================================================================
// activeMode
// ===========================================================================
describe("activeMode", () => {
  test("updates mode when valid and different from current", async () => {
    usersDao.findById.mockResolvedValue({
      ...MOCK_USER,
      active_dark_light_mode: "light",
    });
    usersDao.activeMode.mockResolvedValue();

    await usersService.activeMode(1, "dark");

    expect(usersDao.activeMode).toHaveBeenCalledWith(1, "dark");
  });

  test("does nothing when mode is the same as current", async () => {
    usersDao.findById.mockResolvedValue({
      ...MOCK_USER,
      active_dark_light_mode: "dark",
    });

    await usersService.activeMode(1, "dark");

    expect(usersDao.activeMode).not.toHaveBeenCalled();
  });

  test("throws bad request for invalid mode value", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);

    await expect(usersService.activeMode(1, "rainbow")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(usersDao.activeMode).not.toHaveBeenCalled();
  });

  test("throws not found when user does not exist", async () => {
    usersDao.findById.mockResolvedValue(null);

    await expect(usersService.activeMode(999, "dark")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test.each(["light", "dark", "system"])(
    "accepts valid mode: %s",
    async (mode) => {
      usersDao.findById.mockResolvedValue({
        ...MOCK_USER,
        active_dark_light_mode: "other",
      });
      usersDao.activeMode.mockResolvedValue();

      await expect(usersService.activeMode(1, mode)).resolves.not.toThrow();
    },
  );
});

// ===========================================================================
// activeTheme
// ===========================================================================
describe("activeTheme", () => {
  test("updates theme when user owns it", async () => {
    usersDao.findById.mockResolvedValue({
      ...MOCK_USER,
      active_theme: "indigo",
    });
    userThemesService.getUserThemes.mockResolvedValue([
      { name: "violet" },
      { name: "amber" },
    ]);
    usersDao.activeTheme.mockResolvedValue();

    await usersService.activeTheme(1, "violet");

    expect(usersDao.activeTheme).toHaveBeenCalledWith(1, "violet");
  });

  test("does nothing when theme is already active", async () => {
    usersDao.findById.mockResolvedValue({
      ...MOCK_USER,
      active_theme: "violet",
    });
    userThemesService.getUserThemes.mockResolvedValue([{ name: "violet" }]);

    await usersService.activeTheme(1, "violet");

    expect(usersDao.activeTheme).not.toHaveBeenCalled();
  });

  test("throws forbidden when user does not own the theme", async () => {
    usersDao.findById.mockResolvedValue({
      ...MOCK_USER,
      active_theme: "indigo",
    });
    userThemesService.getUserThemes.mockResolvedValue([{ name: "amber" }]);

    await expect(usersService.activeTheme(1, "violet")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test("throws bad request for invalid theme name", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);

    await expect(
      usersService.activeTheme(1, "nonexistent_theme"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(userThemesService.getUserThemes).not.toHaveBeenCalled();
  });

  test("throws not found when user does not exist", async () => {
    usersDao.findById.mockResolvedValue(null);

    await expect(usersService.activeTheme(999, "dark")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ===========================================================================
// changeUsername
// ===========================================================================
describe("changeUsername", () => {
  test("updates username and returns safe user", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    const updated = { ...MOCK_USER, username: "newuser" };
    usersDao.updateUsername.mockResolvedValue(updated);

    const result = await usersService.changeUsername(1, "newuser");

    expect(usersDao.updateUsername).toHaveBeenCalledWith(1, "newuser");
    expect(result.username).toBe("newuser");
    expect(result).not.toHaveProperty("password_hash");
  });

  test("throws validation error when new username is same as old", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);

    await expect(
      usersService.changeUsername(1, "testuser"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(usersDao.updateUsername).not.toHaveBeenCalled();
  });

  test("throws validation error when new username is too short", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);

    await expect(usersService.changeUsername(1, "ab")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("throws conflict when new username already taken (DB 23505)", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    const dbError = new Error("duplicate");
    dbError.code = "23505";
    usersDao.updateUsername.mockRejectedValue(dbError);

    await expect(
      usersService.changeUsername(1, "takenuser"),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("throws not found when user does not exist", async () => {
    usersDao.findById.mockResolvedValue(null);

    await expect(
      usersService.changeUsername(999, "newuser"),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ===========================================================================
// changePassword
// ===========================================================================
describe("changePassword", () => {
  test("updates password and invalidates tokens on success", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(true);
    passwordUtil.hashPassword.mockResolvedValue("newhash");
    usersDao.updatePassword.mockResolvedValue();
    usersDao.incrementTokenVersion.mockResolvedValue();

    await usersService.changePassword(1, "OldPass1", "NewPass2");

    expect(usersDao.updatePassword).toHaveBeenCalledWith(1, "newhash");
    expect(usersDao.incrementTokenVersion).toHaveBeenCalledWith(1);
  });

  test("throws unauthorized when old password is incorrect", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(false);

    await expect(
      usersService.changePassword(1, "WrongOld1", "NewPass2"),
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(usersDao.updatePassword).not.toHaveBeenCalled();
    expect(usersDao.incrementTokenVersion).not.toHaveBeenCalled();
  });

  test("throws validation error when new password equals old password", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(true);

    await expect(
      usersService.changePassword(1, "SamePass1", "SamePass1"),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(usersDao.updatePassword).not.toHaveBeenCalled();
  });

  test("throws validation error when new password is too weak", async () => {
    usersDao.findById.mockResolvedValue(MOCK_USER);
    passwordUtil.comparePassword.mockResolvedValue(true);

    await expect(
      usersService.changePassword(1, "OldPass1", "weak"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("throws not found when user does not exist", async () => {
    usersDao.findById.mockResolvedValue(null);

    await expect(
      usersService.changePassword(999, "OldPass1", "NewPass2"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ===========================================================================
// deleteAccount
// ===========================================================================
describe("deleteAccount", () => {
  test("deletes user successfully", async () => {
    usersDao.deleteUser.mockResolvedValue(1);

    await expect(usersService.deleteAccount(1)).resolves.not.toThrow();
    expect(usersDao.deleteUser).toHaveBeenCalledWith(1);
  });

  test("throws not found when user does not exist (rowCount 0)", async () => {
    usersDao.deleteUser.mockResolvedValue(0);

    await expect(usersService.deleteAccount(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ===========================================================================
// refreshToken
// ===========================================================================
describe("refreshToken", () => {
  test("generates new token pair from user object", async () => {
    jwtUtil.generateTokens.mockReturnValue({
      accessToken: "newAccess",
      refreshToken: "newRefresh",
    });

    const result = await usersService.refreshToken(MOCK_USER);

    expect(result.accessToken).toBe("newAccess");
    expect(result.refreshToken).toBe("newRefresh");
    expect(jwtUtil.generateTokens).toHaveBeenCalledWith(MOCK_USER);
  });
});
