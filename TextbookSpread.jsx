import { useEffect, useMemo, useRef, useState } from "react";
import { PREVIEW, PREVIEW_WORDS } from "./demo.js";
import { readability } from "./readability.js";

// The landing-page "wow": an open textbook whose right page rewrites itself live.
// Words that disappear get struck out, new words type in, the grade counts down.

const STOPS = [
  { id: "original", label: "Original" },
  { id: 8, label: "Grades 8–9" },
  { id: 4, label: "Grades 4–5" },
  { id: 2, label: "Grades 2–3" },
];
const LANGS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "pt", label: "Português" },
];
const VOCAB = /^(photosynthesis|chlorophyll|chloroplasts)$/i;

const tokenize = (t) => t.match(/\S+\s*/g) || [];
const bare = (w) => w.trim().toLowerCase().replace(/[^\p{L}]/gu, "");

// Longest-common-subsequence diff on words, so unchanged words stay still while the rest rewrites.
function diff(a, b) {
  const A = a.map(bare);
  const B = b.map(bare);
  const dp = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) out.push({ t: b[j], k: "keep" }), i++, j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: a[i], k: "del" }), i++;
    else out.push({ t: b[j], k: "add" }), j++;
  }
  while (i < A.length) out.push({ t: a[i++], k: "del" });
  while (j < B.length) out.push({ t: b[j++], k: "add" });
  return out;
}

function useCountTo(target, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export default function TextbookSpread() {
  const [stop, setStop] = useState(0);
  const [lang, setLang] = useState("en");
  const [tokens, setTokens] = useState(() => tokenize(PREVIEW.original.en).map((t) => ({ t, k: "keep" })));
  const [phase, setPhase] = useState("idle"); // idle | out | in
  const [touched, setTouched] = useState(false);
  const prevText = useRef(PREVIEW.original.en);
  const level = STOPS[stop].id;
  const text = PREVIEW[level].en;
  const grade = useMemo(() => readability(text).grade, [text]);
  const shown = useCountTo(grade);
  const origGrade = useMemo(() => readability(PREVIEW.original.en).grade, []);

  // Animate the rewrite whenever the level changes.
  useEffect(() => {
    if (text === prevText.current) return;
    const d = diff(tokenize(prevText.current), tokenize(text));
    prevText.current = text;
    setTokens(d);
    setPhase("out");
    const t1 = setTimeout(() => setPhase("in"), 650);
    const t2 = setTimeout(() => {
      setTokens((ts) => ts.filter((x) => x.k !== "del").map((x) => ({ ...x, k: x.k === "add" ? "added" : "keep" })));
      setPhase("idle");
    }, 650 + 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [text]);

  // The first-impression moment: a beat after load, the page rewrites itself to Grades 4–5 in Spanish support.
  useEffect(() => {
    if (touched) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => !touched && setStop(2), reduce ? 0 : 1400);
    const t2 = setTimeout(() => !touched && setLang("es"), reduce ? 0 : 3900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [touched]);

  let addIndex = 0;
  return (
    <div className="spread-wrap">
      <div className="spread" aria-label="Example: a textbook paragraph and the same paragraph adapted by SamePage">
        {/* Left page: the textbook as printed */}
        <div className="page page-left">
          <div className="running-head">
            <span>Chapter 7 · Energy in Living Things</span>
          </div>
          <h4 className="tb-heading">7.2 Photosynthesis</h4>
          <p className="tb-body">
            {PREVIEW.original.en} The reaction produces glucose, a sugar the plant uses for energy and growth, and releases oxygen into the atmosphere as a byproduct.
          </p>
          <div className="tb-figure" aria-hidden="true">
            <span>Figure 7.4</span> Cross-section of a leaf showing chloroplasts.
          </div>
          <span className="grade-badge old">Grade {origGrade.toFixed(1)}</span>
          <span className="page-num">214</span>
          <span className="margin-note">too hard?!</span>
        </div>

        <div className="gutter" aria-hidden="true" />

        {/* Right page: SamePage's version, rewriting live */}
        <div className="page page-right">
          <div className="running-head right">
            <span className="sp-mark">samepage</span>
            <span>{STOPS[stop].label}</span>
          </div>
          <h4 className="tb-heading">How plants make food</h4>
          <p className={`tb-body live phase-${phase}`} aria-live="polite">
            {tokens.map((tok, i) => {
              const word = tok.t.trim().replace(/[^\p{L}]/gu, "");
              const isVocab = VOCAB.test(word) && tok.k !== "del";
              const delay = tok.k === "add" ? addIndex++ * 38 : 0;
              const tr = lang !== "en" && isVocab ? PREVIEW_WORDS[lang]?.[word.toLowerCase()] : null;
              const trailing = tok.t.slice(tok.t.trimEnd().length);
              const core = tok.t.trimEnd();
              return (
                <span key={i + tok.k + tok.t} className={`tok tok-${tok.k}`} style={tok.k === "add" ? { animationDelay: `${delay}ms` } : undefined}>
                  {isVocab ? (
                    <mark className={`vocab ${tr ? "has-tr" : ""}`}>
                      {core}
                      {tr && <span className="vocab-inline">{tr}</span>}
                    </mark>
                  ) : (
                    core
                  )}
                  {trailing}
                </span>
              );
            })}
          </p>
          {lang !== "en" && (
            <p className="tb-trans" key={`${level}-${lang}`} lang={lang}>
              {PREVIEW[level][lang]}
            </p>
          )}
          <span className="grade-badge new">
            Grade <b>{shown.toFixed(1)}</b>
          </span>
          <span className="page-num">214</span>
          <span className="keep-note">✓ every fact kept</span>
        </div>
      </div>

      <div className="spread-controls">
        <div className="slider-block">
          <span className="ctl-label">Language support</span>
          <div className="stop-slider" role="radiogroup" aria-label="Reading level">
            <span className="stop-track" />
            <span className="stop-fill" style={{ width: `${(stop / (STOPS.length - 1)) * 100}%` }} />
            {STOPS.map((s, i) => (
              <button
                key={String(s.id)}
                role="radio"
                aria-checked={stop === i}
                className={`stop ${stop >= i ? "passed" : ""} ${stop === i ? "on" : ""}`}
                style={{ left: `${(i / (STOPS.length - 1)) * 100}%` }}
                onClick={() => {
                  setTouched(true);
                  setStop(i);
                }}
              >
                <span className="stop-dot" />
                <span className="stop-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lang-block">
          <span className="ctl-label">Explain in</span>
          <div className="lang-chips" role="radiogroup" aria-label="Home language">
            {LANGS.map((l) => (
              <button
                key={l.id}
                role="radio"
                aria-checked={lang === l.id}
                className={lang === l.id ? "on" : ""}
                onClick={() => {
                  setTouched(true);
                  setLang(l.id);
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
