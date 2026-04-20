import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// change NODE_ENV value to "test" before running load-test.js
// change back to "development" afterwards
// delete test users from the database afterwards

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const loginDuration = new Trend("login_duration", true);
const registerDuration = new Trend("register_duration", true);
const errorRate = new Rate("error_rate");
const blockchainCalls = new Counter("blockchain_calls");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// timestamp ms + VU + iter = globally unique across runs
function credentials(vu, iter) {
  const ts = Date.now();
  return {
    username: `lt${ts}v${vu}i${iter}`.slice(0, 30), // max 30 char
    password: "LoadTest1234!",
  };
}

// ---------------------------------------------------------------------------
// Load profile
// ---------------------------------------------------------------------------
export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.10"],
    error_rate: ["rate<0.10"],
    login_duration: ["p(95)<1500"],
    register_duration: ["p(95)<2000"],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const JSON_HEADERS = { "Content-Type": "application/json" };

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function ok(res, tag) {
  const passed = check(res, {
    [`${tag} – status 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });
  errorRate.add(!passed);
  return passed;
}

// ---------------------------------------------------------------------------
// Main VU scenario
// ---------------------------------------------------------------------------
export default function () {
  let token = null;
  const creds = credentials(__VU, __ITER);

  // ── 1. REGISTER ──────────────────────────────────────────────────────────
  group("Auth – register", () => {
    const res = http.post(
      `${BASE_URL}/users/register`,
      JSON.stringify({ username: creds.username, password: creds.password }),
      { headers: JSON_HEADERS },
    );
    registerDuration.add(res.timings.duration);
    ok(res, "register");
  });

  sleep(0.5);

  // ── 2. LOGIN ─────────────────────────────────────────────────────────────
  group("Auth – login", () => {
    const res = http.post(
      `${BASE_URL}/users/login`,
      JSON.stringify({ username: creds.username, password: creds.password }),
      { headers: JSON_HEADERS },
    );
    loginDuration.add(res.timings.duration);
    if (ok(res, "login")) {
      try {
        token = res.json("accessToken");
      } catch (_) {}
    }
  });

  if (!token) {
    console.error(`VU ${__VU} iter ${__ITER}: no accessToken after login`);
    errorRate.add(1);
    return;
  }

  let auth = authHeaders(token);
  sleep(0.3);

  // ── 3. TOKEN REFRESH ─────────────────────────────────────────────────────
  // refresh_token HttpOnly cookie is sent automatically by k6
  group("Auth – refresh token", () => {
    const res = http.post(`${BASE_URL}/users/refresh`, null, { headers: auth });
    check(res, { "refresh – responded": (r) => r.status !== 0 });
    try {
      const newToken = res.json("accessToken");
      if (newToken) {
        token = newToken;
        auth = authHeaders(token);
      }
    } catch (_) {}
  });

  sleep(0.3);

  // ── 4. USER PROFILE & ACTIVITY ───────────────────────────────────────────
  group("Users – profile & activity", () => {
    ok(http.get(`${BASE_URL}/users/me`, { headers: auth }), "GET /users/me");
    ok(
      http.get(`${BASE_URL}/users/activity`, { headers: auth }),
      "GET /users/activity",
    );
  });

  sleep(0.3);

  // ── 5. USER SETTINGS ─────────────────────────────────────────────────────
  group("Users – settings", () => {
    ok(
      http.put(
        `${BASE_URL}/users/active-mode`,
        JSON.stringify({ modeName: "dark" }),
        { headers: auth },
      ),
      "PUT active-mode",
    );
    // active-theme: only unlocked themes can be activated – test users have none
    // blockchain purchase required first → just check it responds
    check(
      http.put(
        `${BASE_URL}/users/active-theme`,
        JSON.stringify({ themeName: "indigo" }),
        { headers: auth },
      ),
      { "PUT active-theme – responded": (r) => r.status !== 0 },
    );
  });

  sleep(0.3);

  // ── 6. GENRES ─────────────────────────────────────────────────────────────
  group("Genres", () => {
    ok(http.get(`${BASE_URL}/api/genres/movies`), "GET genres/movies");
    ok(http.get(`${BASE_URL}/api/genres/series`), "GET genres/series");
  });

  sleep(0.3);

  // ── 7. MOVIES ─────────────────────────────────────────────────────────────
  group("Movies", () => {
    ok(http.get(`${BASE_URL}/api/movies/popular`), "GET movies/popular");
    ok(http.get(`${BASE_URL}/api/movies/toprated`), "GET movies/toprated");
    ok(
      http.get(`${BASE_URL}/api/movies/search?query=action`),
      "GET movies/search",
    );
    ok(
      http.get(`${BASE_URL}/api/movies/filter?genreIds=28`),
      "GET movies/filter",
    );
    ok(http.get(`${BASE_URL}/api/movies/details/550`), "GET movies/details");
  });

  sleep(0.3);

  // ── 8. SERIES ─────────────────────────────────────────────────────────────
  group("Series", () => {
    ok(http.get(`${BASE_URL}/api/series/popular`), "GET series/popular");
    ok(http.get(`${BASE_URL}/api/series/toprated`), "GET series/toprated");
    ok(
      http.get(`${BASE_URL}/api/series/search?query=drama`),
      "GET series/search",
    );
    ok(
      http.get(`${BASE_URL}/api/series/filter?genreIds=18`),
      "GET series/filter",
    );
    ok(http.get(`${BASE_URL}/api/series/details/1399`), "GET series/details");
  });

  sleep(0.3);

  // ── 9. MOVIE PROGRESS ─────────────────────────────────────────────────────
  group("Movie progress", () => {
    ok(
      http.post(
        `${BASE_URL}/movie-progress`,
        JSON.stringify({ movieId: 550, status: "plan_to_watch" }),
        { headers: auth },
      ),
      "POST movie-progress",
    );
    sleep(0.2);
    ok(
      http.get(`${BASE_URL}/movie-progress`, { headers: auth }),
      "GET movie-progress",
    );
    ok(
      http.get(`${BASE_URL}/movie-progress/details/550`, { headers: auth }),
      "GET movie-progress/details",
    );
    sleep(0.2);
    ok(
      http.del(`${BASE_URL}/movie-progress/550`, null, { headers: auth }),
      "DELETE movie-progress",
    );
  });

  sleep(0.3);

  // ── 10. SERIES PROGRESS ───────────────────────────────────────────────────
  group("Series progress", () => {
    ok(
      http.post(
        `${BASE_URL}/series-progress`,
        JSON.stringify({
          seriesId: 1399,
          status: "plan_to_watch",
          season: 1,
          episode: 1,
        }),
        { headers: auth },
      ),
      "POST series-progress",
    );
    sleep(0.2);
    ok(
      http.get(`${BASE_URL}/series-progress`, { headers: auth }),
      "GET series-progress",
    );
    ok(
      http.get(`${BASE_URL}/series-progress/details/1399`, { headers: auth }),
      "GET series-progress/details",
    );
    sleep(0.2);
    ok(
      http.del(`${BASE_URL}/series-progress/1399`, null, { headers: auth }),
      "DELETE series-progress",
    );
  });

  sleep(0.3);

  // ── 11. USER REVIEWS ──────────────────────────────────────────────────────
  group("User reviews", () => {
    ok(
      http.post(
        `${BASE_URL}/user-reviews`,
        JSON.stringify({
          contentId: 550,
          contentType: "movie",
          score: 4,
          review: "Load test review",
        }),
        { headers: auth },
      ),
      "POST user-reviews",
    );
    sleep(0.2);
    ok(
      http.get(`${BASE_URL}/user-reviews`, { headers: auth }),
      "GET user-reviews",
    );
    ok(
      http.get(`${BASE_URL}/user-reviews/movie/550`),
      "GET user-reviews/content (public)",
    );
    sleep(0.2);
    ok(
      http.del(`${BASE_URL}/user-reviews/movie/550`, null, { headers: auth }),
      "DELETE user-review",
    );
  });

  sleep(0.3);

  // ── 12. USER STATISTICS ───────────────────────────────────────────────────
  group("User statistics", () => {
    ok(
      http.get(`${BASE_URL}/user-statistics/movie-status`, { headers: auth }),
      "GET stats/movie-status",
    );
    ok(
      http.get(`${BASE_URL}/user-statistics/series-status`, { headers: auth }),
      "GET stats/series-status",
    );
    ok(
      http.get(`${BASE_URL}/user-statistics/movie-genres`, { headers: auth }),
      "GET stats/movie-genres",
    );
    ok(
      http.get(`${BASE_URL}/user-statistics/series-genres`, { headers: auth }),
      "GET stats/series-genres",
    );
  });

  sleep(0.3);

  // ── 13. QUESTS (blockchain – NODE_ENV=test bypass) ───────────────────────
  group("Quests – blockchain", () => {
    blockchainCalls.add(1);
    ok(http.get(`${BASE_URL}/quests`, { headers: auth }), "GET quests");
    sleep(0.2);
    ok(
      http.post(
        `${BASE_URL}/quests/reroll`,
        JSON.stringify({ slotNumber: 1 }),
        { headers: auth },
      ),
      "POST quests/reroll",
    );
    sleep(0.3);
    // claim: quest may not be completed → 400 acceptable
    const claimRes = http.post(
      `${BASE_URL}/quests/claim`,
      JSON.stringify({ slotNumber: 1 }),
      { headers: auth },
    );
    check(claimRes, { "quests/claim – responded": (r) => r.status !== 0 });
  });

  sleep(0.3);

  // ── 14. WALLET (blockchain – NODE_ENV=test bypasses checkWalletBalance) ──
  group("Wallet", () => {
    blockchainCalls.add(1);
    ok(http.get(`${BASE_URL}/wallet`, { headers: auth }), "GET wallet");
    sleep(0.2);
    // wallet/connect: requires valid EIP-712 signature → responded check only
    check(
      http.post(
        `${BASE_URL}/wallet/connect`,
        JSON.stringify({
          walletAddress: `0x${__VU.toString().padStart(40, "0")}`,
          v: 27,
          r: "0x0000000000000000000000000000000000000000000000000000000000000001",
          s: "0x0000000000000000000000000000000000000000000000000000000000000001",
          deadline: Math.floor(Date.now() / 1000) + 3600,
        }),
        { headers: auth },
      ),
      { "POST wallet/connect – responded": (r) => r.status !== 0 },
    );
    sleep(0.2);
    ok(
      http.del(`${BASE_URL}/wallet/disconnect`, null, { headers: auth }),
      "DELETE wallet/disconnect",
    );
  });

  sleep(0.3);

  // ── 15. USER THEMES (blockchain – NODE_ENV=test bypasses checkWalletBalance)
  group("User themes – blockchain", () => {
    blockchainCalls.add(1);
    ok(
      http.get(`${BASE_URL}/user-themes`, { headers: auth }),
      "GET user-themes",
    );
    sleep(0.2);
    // user-themes/buy: requires verified wallet + valid on-chain permit → responded check only
    check(
      http.post(
        `${BASE_URL}/user-themes`,
        JSON.stringify({
          theme: "dark",
          v: 27,
          r: "0x0000000000000000000000000000000000000000000000000000000000000001",
          s: "0x0000000000000000000000000000000000000000000000000000000000000001",
          deadline: Math.floor(Date.now() / 1000) + 3600,
        }),
        { headers: auth },
      ),
      { "POST user-themes/buy – responded": (r) => r.status !== 0 },
    );
  });

  sleep(0.3);

  // ── 16. ACCOUNT CHANGES (accountLimiter: max 10 / 15min – 1x per iter OK) ─
  group("Users – account changes", () => {
    ok(
      http.put(
        `${BASE_URL}/users/change-username`,
        JSON.stringify({ newUsername: `${creds.username}x` }),
        { headers: auth },
      ),
      "PUT change-username",
    );
    sleep(0.2);
    // change-username csak, password change-t a logout UTÁNra tesszük
    // mert change-password törli a refresh_token cookie-t → logout failel
  });

  sleep(0.3);

  // ── 17. LOGOUT (change-password ELŐTT – mert az törli a cookie-t) ─────────
  group("Auth – logout", () => {
    ok(
      http.post(`${BASE_URL}/users/logout`, null, { headers: auth }),
      "POST logout",
    );
  });

  sleep(0.2);

  // ── 18. DELETE ACCOUNT (cleanup – always last) ────────────────────────────
  // change-password invalidálja a tokent (incrementTokenVersion) → re-login kell
  group("Users – delete account", () => {
    // 1. change-password az eredeti jelszóval
    http.put(
      `${BASE_URL}/users/change-password`,
      JSON.stringify({
        oldPassword: creds.password,
        newPassword: "NewPass5678!",
      }),
      { headers: auth },
    );

    sleep(0.2);

    // 2. re-login az új jelszóval – új token kell a törléshez
    const loginRes = http.post(
      `${BASE_URL}/users/login`,
      JSON.stringify({
        username: `${creds.username}x`,
        password: "NewPass5678!",
      }),
      { headers: JSON_HEADERS },
    );
    let delToken = null;
    try {
      delToken = loginRes.json("accessToken");
    } catch (_) {}

    if (delToken) {
      ok(
        http.del(`${BASE_URL}/users/me`, null, {
          headers: authHeaders(delToken),
        }),
        "DELETE /users/me",
      );
    }
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
