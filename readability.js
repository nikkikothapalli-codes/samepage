// Flesch-Kincaid grade level, computed in the browser so the before/after numbers are real math, not an AI guess.
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = word.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function readability(text) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const sentences = Math.max(1, (clean.match(/[.!?]+(\s|$)/g) || []).length);
  const words = clean.split(" ").filter((w) => /[a-zA-Z]/.test(w));
  const wordCount = Math.max(1, words.length);
  const syllables = words.reduce((n, w) => n + countSyllables(w), 0);
  const grade = 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
  return {
    grade: Math.max(1, Math.round(grade * 10) / 10),
    wordsPerSentence: Math.round((wordCount / sentences) * 10) / 10,
  };
}
