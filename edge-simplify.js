// SamePage API: Netlify Edge Function (copied into netlify/edge-functions/ at build time).
// Edge functions aren't bound by the 10-second limit of standard Netlify functions,
// which matters because one adaptation returns a lot of structured data.

const LEVELS = {
  2: "2nd–3rd grade (lots of language support)",
  4: "4th–5th grade",
  6: "6th–7th grade",
  8: "8th–9th grade",
};

// Tried in order; if Google retires a model name the next one is used.
function models() {
  const custom = Netlify.env.get("GEMINI_MODEL");
  return [custom, "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"].filter(Boolean);
}

function buildPrompt({ text, level, language, hasImage }) {
  const keepOriginal = level === "original";
  const levelText = keepOriginal ? null : LEVELS[level] || LEVELS[4];

  return `You are SamePage, an adaptive textbook tool for students learning school subjects in English while English is not their first language. Their home language is ${language}.

${hasImage
    ? "The student uploaded a PHOTO of a textbook page. First transcribe the main body text exactly (skip page numbers, running headers and image captions unless they carry content)."
    : `The student provided this passage:\n"""\n${text}\n"""`}

Tasks:
1. Split the original text into short consecutive chunks of one or two sentences, covering the whole text in order. These are the "segments".
2. For each segment, write the adapted English version${keepOriginal
    ? ". Keep the original wording exactly (adapted = source)."
    : ` at a ${levelText} reading level: short sentences, common words, keep every fact, add nothing new, keep important subject terms but explain them simply.`}
   Then translate that adapted version into natural, everyday ${language}.
   Mark "new_paragraph": true on a segment that starts a new paragraph.
3. Choose 5–8 important vocabulary words that appear word-for-word in the adapted English. For each: simple English definition, ${language} translation of the word, the definition in ${language}, and one short example sentence in simple English.
4. List 3–6 key concepts a teacher would expect a student to learn from the original. For each, quote the exact sentence from the ORIGINAL that teaches it ("source_evidence") and the exact sentence from your ADAPTED text that keeps it ("adapted_evidence"). If the adapted text lost a concept, set "adapted_evidence" to "".
5. Describe how the concepts relate: 2–8 links between concept names with a 1–3 word label.
6. Give a short title and one school subject (for example: Science, History, Geography, Math, Literature, Civics, Health).

Respond ONLY with JSON in exactly this shape:
{
  "title": "",
  "subject": "",
  "original_text": "${hasImage ? "the text you transcribed" : "the original passage, unchanged"}",
  "segments": [ { "source": "", "adapted": "", "translation": "", "new_paragraph": false } ],
  "vocab": [ { "word": "", "definition": "", "translation": "", "definition_translated": "", "example": "" } ],
  "key_concepts": [ { "name": "", "source_evidence": "", "adapted_evidence": "" } ],
  "concept_links": [ { "from": "", "to": "", "label": "" } ]
}`;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function parseModelJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON");
    return JSON.parse(raw.slice(start, end + 1));
  }
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Use POST" });

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(500, { error: "The server is missing GEMINI_API_KEY. Add it in Netlify under Environment variables, then redeploy." });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "The request couldn't be read." });
  }

  const { text = "", image = null, level = 4, language = "Spanish" } = body;
  const hasImage = Boolean(image && image.data);
  if (!hasImage && text.trim().length < 40) return json(400, { error: "Add at least a few sentences, or upload a photo of the page." });
  if (text.length > 8000) return json(400, { error: "That passage is over 8,000 characters. Try one page at a time." });
  if (typeof language !== "string" || language.length > 40) return json(400, { error: "Pick a language from the list." });

  const parts = [{ text: buildPrompt({ text, level: level === "original" ? "original" : Number(level), language, hasImage }) }];
  if (hasImage) parts.push({ inline_data: { mime_type: image.mimeType || "image/jpeg", data: image.data } });

  // Respond immediately and keep the connection alive while Gemini works, so Netlify's
  // 40-second response-header timeout can't cut off a slow (but successful) adaptation.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const ping = setInterval(() => controller.enqueue(encoder.encode(" ")), 4000);
      let payload;
      try {
        payload = await callGemini(apiKey, parts);
      } catch (e) {
        payload = { error: e.message || "Something went wrong. Try again." };
      }
      clearInterval(ping);
      controller.enqueue(encoder.encode(JSON.stringify(payload)));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
};

async function callGemini(apiKey, parts) {
  let lastError = "";
  for (const model of models()) {
    // Ask for low "thinking" first (faster); if a model doesn't support that setting, retry without it.
    for (const thinking of [{ thinkingLevel: "low" }, null]) {
      const generationConfig = { responseMimeType: "application/json", temperature: 0.3 };
      if (thinking) generationConfig.thinkingConfig = thinking;
      let res;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig }),
        });
      } catch {
        throw new Error("Couldn't reach the AI service. Check your connection and try again.");
      }

      if (res.ok) {
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text || "").join("") || "";
        try {
          return parseModelJson(raw);
        } catch {
          console.error("Unparseable model output", raw.slice(0, 400));
          lastError = "The AI sent back something unreadable.";
          break; // try the next model
        }
      }

      const detail = await res.text();
      let message = detail;
      try {
        message = JSON.parse(detail)?.error?.message || detail;
      } catch {}
      console.error(`Gemini error (${model}, thinking=${!!thinking})`, res.status, message);
      lastError = `${model}: ${res.status} ${message}`.slice(0, 300);

      if (res.status === 400 && thinking && /think/i.test(message)) continue; // retry same model without thinking config
      if (res.status === 404 || (res.status === 400 && /not found|not supported|unsupported/i.test(message))) break; // next model
      if (res.status === 429) throw new Error("Too many requests right now. Wait a few seconds and try again.");
      if (res.status === 400 && /api key/i.test(message)) throw new Error("The Gemini API key isn't valid. Check GEMINI_API_KEY in Netlify, then redeploy.");
      if (res.status === 403) throw new Error(`The Gemini API key was rejected: ${message.slice(0, 160)}`);
      if (res.status >= 500) break; // Google-side hiccup: try the next model
      throw new Error(`The AI service returned an error: ${lastError}`);
    }
  }
  throw new Error(`The AI couldn't finish. ${lastError}`);
}

export const config = { path: "/api/adapt" };
