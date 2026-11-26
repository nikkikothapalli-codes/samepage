// Calls the edge function and normalizes the result so the UI never trips over a missing field.
export async function adaptPage({ text, image, level, language, signal }) {
  const res = await fetch("/api/adapt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, image, level, language }),
    signal,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server didn't respond correctly. If you're running this locally, use `netlify dev`.");
  }
  if (!res.ok || data.error) throw new Error(data.error || "Something went wrong. Try again.");
  return normalize(data, text);
}

const str = (v) => (typeof v === "string" ? v.trim() : "");

export function normalize(d, fallbackText = "") {
  const segments = (Array.isArray(d.segments) ? d.segments : [])
    .map((s, i) => ({
      id: i,
      source: str(s.source),
      adapted: str(s.adapted) || str(s.source),
      translation: str(s.translation),
      newParagraph: i === 0 || Boolean(s.new_paragraph),
    }))
    .filter((s) => s.adapted);
  if (!segments.length) throw new Error("The AI didn't return any text. Try again.");

  const original = str(d.original_text) || fallbackText || segments.map((s) => s.source).join(" ");
  return {
    title: str(d.title) || "Untitled passage",
    subject: str(d.subject) || "General",
    originalText: original,
    segments,
    vocab: (d.vocab || [])
      .filter((v) => str(v.word))
      .map((v) => ({
        word: str(v.word),
        definition: str(v.definition),
        translation: str(v.translation),
        definitionTranslated: str(v.definition_translated),
        example: str(v.example),
      })),
    concepts: (d.key_concepts || [])
      .filter((c) => str(c.name))
      .map((c) => ({ name: str(c.name), sourceEvidence: str(c.source_evidence), adaptedEvidence: str(c.adapted_evidence) })),
    links: (d.concept_links || []).filter((l) => str(l.from) && str(l.to)).map((l) => ({ from: str(l.from), to: str(l.to), label: str(l.label) })),
  };
}

export const adaptedText = (segments) =>
  segments.reduce((acc, s, i) => acc + (i === 0 ? "" : s.newParagraph ? "\n\n" : " ") + s.adapted, "");
