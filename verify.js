// Knowledge-retention check, done in the browser rather than trusting the AI's word.
// A concept counts as retained only if its quoted evidence really appears in BOTH the original
// and the adapted text. Anything else is shown as unverified or missing, never as a pass.
const STOP = new Set("a an the of to in on and or is are was were be by for with as at that this it its from into than then so".split(" "));
const words = (t) => (t || "").toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

function coverage(evidence, text) {
  const ev = words(evidence);
  if (!ev.length) return 0;
  const bag = new Set(words(text));
  return ev.filter((w) => bag.has(w)).length / ev.length;
}

export function verifyConcepts(concepts, originalText, adaptedText) {
  return concepts.map((c) => {
    if (!c.adaptedEvidence) return { ...c, status: "missing", note: "The adapted text doesn't cover this concept." };
    const inSource = coverage(c.sourceEvidence, originalText);
    const inAdapted = coverage(c.adaptedEvidence, adaptedText);
    if (inSource >= 0.8 && inAdapted >= 0.8) return { ...c, status: "retained", note: "Found in both versions." };
    if (inSource < 0.8) return { ...c, status: "unverified", note: "Couldn't find the quoted original sentence." };
    return { ...c, status: "unverified", note: "Couldn't find the quoted adapted sentence." };
  });
}

// Which adapted segment holds a piece of evidence (for jumping to it from the knowledge map).
export function findSegment(segments, evidence) {
  let best = -1;
  let bestScore = 0;
  segments.forEach((s, i) => {
    const score = coverage(evidence, s.adapted);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return bestScore >= 0.5 ? best : -1;
}
