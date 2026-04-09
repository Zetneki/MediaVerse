const { BANNED_WORDS } = require("../constants/banned-words");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/@/g, "a")
    .replace(/!/g, "i")
    .replace(/\+/g, "t")
    .replace(/7/g, "t")
    .replace(/\s+/g, "");

const wildcardRegexes = [];
const exactWords = new Set();
const exactPhrases = [];
const normalizedBanned = new Set();

BANNED_WORDS.forEach((word) => {
  const lowerWord = word.toLowerCase();
  if (lowerWord.includes("*")) {
    const escaped = escapeRegex(lowerWord).replace(/\\\*/g, "[a-z]*");
    wildcardRegexes.push(new RegExp(`\\b${escaped}\\b`, "i"));
  } else if (lowerWord.includes(" ")) {
    exactPhrases.push(lowerWord);
  } else {
    exactWords.add(lowerWord);
    normalizedBanned.add(normalize(lowerWord));
  }
});

const containsProfanity = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();

  if (wildcardRegexes.some((r) => r.test(lower))) return true;

  if (exactPhrases.some((phrase) => lower.includes(phrase))) return true;

  const words = lower.split(/[\s\W]+/).filter(Boolean);
  if (words.some((w) => exactWords.has(w))) return true;

  const normalizedWords = new Set(
    lower
      .split(/[\s\W]+/)
      .filter(Boolean)
      .map((w) => normalize(w)),
  );
  return [...normalizedBanned].some((w) => normalizedWords.has(w));
};

module.exports = { containsProfanity };
