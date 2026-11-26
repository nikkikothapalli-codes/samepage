// A passage keeps the original once, plus one adapted version per level + language,
// so switching back to a level you've seen is instant.
import { DEMO_RESULT } from "./demo.js";
import { getState, newId, savePassage } from "./store.js";

export const versionKey = (level, language) => `${level}|${language}`;

export function makePassage(result, { level, language, thumb, source }) {
  return {
    id: newId(),
    createdAt: Date.now(),
    title: result.title,
    subject: result.subject,
    originalText: result.originalText,
    thumb: thumb || null,
    source,
    level,
    language,
    versions: { [versionKey(level, language)]: result },
    bookmarked: false,
  };
}

export function openDemo() {
  const existing = getState().passages.find((p) => p.id === "demo");
  if (!existing) {
    savePassage({
      ...makePassage(DEMO_RESULT, { level: 4, language: "Spanish", source: "demo" }),
      id: "demo",
      isDemo: true,
    });
  }
  window.location.hash = "/read/demo";
}
