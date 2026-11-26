import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Bookmark, BookmarkCheck, BookOpen, Check, ChevronLeft, ChevronRight, Columns2, FileText,
  Languages, Loader2, Network, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Settings2, Sparkles, Star, X,
} from "lucide-react";
import { getState, isWordSaved, toggleWord, updatePassage, updateSettings, useStore } from "./store.js";
import { adaptPage, adaptedText } from "./api.js";
import { findLang, findLevel, subjectStyle } from "./constants.js";
import { versionKey } from "./passages.js";
import { readability } from "./readability.js";
import { findSegment, verifyConcepts } from "./verify.js";
import { BookArt } from "./Illustrations.jsx";
import { EmptyState, LanguagePicker, LevelSteps, ProgressRing, Segmented, Widget } from "./ui.jsx";
import KnowledgeMap from "./KnowledgeMap.jsx";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Split one segment's text into plain text and vocab marks (first appearance of each word in the passage).
function markVocab(text, vocab, used) {
  if (!vocab.length) return [text];
  const sorted = [...vocab].sort((a, b) => b.word.length - a.word.length);
  const re = new RegExp(`(?<![\\p{L}])(${sorted.map((v) => esc(v.word)).join("|")})(?![\\p{L}])`, "giu");
  const out = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const key = m[0].toLowerCase();
    if (used.has(key)) continue;
    const entry = sorted.find((v) => v.word.toLowerCase() === key);
    if (!entry) continue;
    used.add(key);
    out.push(text.slice(last, m.index), { text: m[0], entry });
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

function groupParagraphs(segments) {
  const paras = [];
  segments.forEach((s, i) => {
    if (i === 0 || s.newParagraph) paras.push([]);
    paras[paras.length - 1].push(s);
  });
  return paras;
}

export default function Workspace({ id }) {
  const { passages, settings } = useStore();
  const passage = passages.find((p) => p.id === id);

  const [view, setView] = useState("adapted"); // adapted | original | compare
  const [center, setCenter] = useState("read"); // read | map
  const [langMode, setLangMode] = useState("english"); // english | bilingual | home
  const [support, setSupport] = useState("vocab"); // vocab | define | independent
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth > 1280);
  const [rightOpen, setRightOpen] = useState(true);
  const [hoverSeg, setHoverSeg] = useState(null);
  const [flashSeg, setFlashSeg] = useState(null);
  const [pop, setPop] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [openConcept, setOpenConcept] = useState(null);
  const [fade, setFade] = useState(false);
  const readRef = useRef(null);
  const [reveal, setReveal] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setReveal(false), 600 + (passage?.versions?.[versionKey(passage.level, passage.language)]?.segments.length || 0) * 260 + 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const level = passage?.level ?? 4;
  const language = passage?.language ?? settings.language;
  const lang = findLang(language);
  const version = passage?.versions?.[versionKey(level, language)];

  useEffect(() => {
    if (passage) updatePassage(passage.id, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const close = () => setPop(null);
    const key = (e) => e.key === "Escape" && setPop(null);
    document.addEventListener("click", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", key);
    };
  }, []);

  const adapted = useMemo(() => (version ? adaptedText(version.segments) : ""), [version]);
  const verified = useMemo(() => (version ? verifyConcepts(version.concepts, passage.originalText, adapted) : []), [version, adapted, passage?.originalText]);
  const before = useMemo(() => readability(passage?.originalText || ""), [passage?.originalText]);
  const after = useMemo(() => readability(adapted), [adapted]);

  if (!passage) {
    return (
      <div className="page">
        <EmptyState illustration={<BookArt />} title="We couldn't find that page." action={<a className="btn btn-primary" href="#/library">Go to my library</a>}>
          It may have been removed from this browser.
        </EmptyState>
      </div>
    );
  }

  // Switching level or language fetches (once) and caches that version.
  async function switchTo(nextLevel, nextLang) {
    const key = versionKey(nextLevel, nextLang);
    setError("");
    if (passage.versions[key]) {
      setFade(true);
      setTimeout(() => {
        updatePassage(passage.id, { level: nextLevel, language: nextLang });
        setFade(false);
      }, 180);
      return;
    }
    setBusy(String(nextLevel) + nextLang);
    try {
      const result = await adaptPage({ text: passage.originalText, level: nextLevel, language: nextLang });
      const fresh = getState().passages.find((p) => p.id === passage.id);
      setFade(true);
      setTimeout(() => {
        updatePassage(passage.id, { level: nextLevel, language: nextLang, versions: { ...fresh.versions, [key]: result } });
        setFade(false);
      }, 180);
    } catch (e) {
      setError(passage.isDemo ? `The demo only includes Grades 4–5 in Español offline. Live switching needs the AI connection: ${e.message}` : e.message);
    } finally {
      setBusy(null);
    }
  }

  function jumpTo(segIndex) {
    if (segIndex < 0) return;
    setCenter("read");
    setView("adapted");
    setFlashSeg(segIndex);
    setTimeout(() => {
      readRef.current?.querySelector(`[data-seg="${segIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    setTimeout(() => setFlashSeg(null), 2400);
  }

  function openPop(e, entry) {
    e.stopPropagation();
    if (support === "independent") return;
    const r = e.currentTarget.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 24);
    setPop({ entry, top: r.bottom + window.scrollY + 10, left: Math.max(12, Math.min(r.left + window.scrollX - 20, window.scrollX + window.innerWidth - w - 12)) });
  }

  const st = subjectStyle(passage.subject);
  const retained = verified.filter((c) => c.status === "retained").length;
  const vocab = version?.vocab || [];
  const word = vocab[Math.min(wordIdx, Math.max(0, vocab.length - 1))];

  // ---------- Reading surface ----------
  function renderReading() {
    if (!version) {
      return (
        <div className="reading-loading">
          <Loader2 className="spin" /> Preparing this version…
        </div>
      );
    }
    if (view === "original") {
      return (
        <div className="reading-original">
          {passage.originalText.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );
    }
    if (view === "compare") {
      return (
        <div className="compare">
          <div className="compare-head">
            <span>Original</span>
            <span>Adapted · {findLevel(level).label}</span>
          </div>
          {version.segments.map((s, i) => (
            <div key={i} className={`compare-row ${hoverSeg === i ? "hot" : ""}`} onMouseEnter={() => setHoverSeg(i)} onMouseLeave={() => setHoverSeg(null)} onFocus={() => setHoverSeg(i)} tabIndex={0}>
              <p className="c-src">{s.source}</p>
              <p className="c-ad">{s.adapted}</p>
            </div>
          ))}
        </div>
      );
    }

    const used = new Set();
    const paras = groupParagraphs(version.segments);
    return paras.map((para, pi) => (
      <div key={pi} className="para-block">
        {langMode !== "home" && (
          <p>
            {para.map((s) => (
              <span
                key={s.id}
                data-seg={s.id}
                style={{ "--i": s.id }}
                className={`seg ${hoverSeg === s.id ? "hot" : ""} ${flashSeg === s.id ? "flash" : ""}`}
                onMouseEnter={() => setHoverSeg(s.id)}
                onMouseLeave={() => setHoverSeg(null)}
              >
                {(support === "independent" ? [s.adapted] : markVocab(s.adapted, vocab, used)).map((part, k) =>
                  typeof part === "string" ? (
                    part
                  ) : (
                    <mark key={k} className="vocab" tabIndex={0} role="button" aria-label={`${part.text}: show meaning`} onClick={(e) => openPop(e, part.entry)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openPop(e, part.entry))}>
                      {part.text}
                      {support === "vocab" && part.entry.translation && (
                        <span className="vocab-inline" lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>
                          {part.entry.translation}
                        </span>
                      )}
                    </mark>
                  )
                )}{" "}
              </span>
            ))}
          </p>
        )}
        {langMode !== "english" && (
          <p className={`trans ${langMode === "home" ? "solo" : ""}`} lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>
            {para.map((s) => (
              <span key={s.id} data-seg={langMode === "home" ? s.id : undefined} className={`seg ${hoverSeg === s.id ? "hot" : ""}`} onMouseEnter={() => setHoverSeg(s.id)} onMouseLeave={() => setHoverSeg(null)}>
                {s.translation}{" "}
              </span>
            ))}
          </p>
        )}
      </div>
    ));
  }

  return (
    <div className={`workspace ${leftOpen ? "left-open" : ""} ${rightOpen ? "right-open" : ""}`}>
      {/* Header */}
      <header className="ws-head">
        <div className="ws-title">
          <a className="icon-btn" href="#/library" aria-label="Back to library">
            <ArrowLeft size={20} />
          </a>
          <div>
            <span className="subject-chip" style={{ background: st.color, color: st.ink }}>
              {passage.subject}
              {passage.isDemo && " · Demo"}
            </span>
            <h1>{passage.title}</h1>
          </div>
          <button className="icon-btn" onClick={() => updatePassage(passage.id, { bookmarked: !passage.bookmarked })} aria-pressed={passage.bookmarked} aria-label={passage.bookmarked ? "Remove bookmark" : "Bookmark this page"}>
            {passage.bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
        <div className="ws-tools">
          <button className="icon-btn" onClick={() => setLeftOpen((o) => !o)} aria-label={leftOpen ? "Hide original page" : "Show original page"} title="Original page">
            {leftOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <Segmented
            label="View"
            size="sm"
            value={view}
            onChange={(v) => {
              setView(v);
              setCenter("read");
            }}
            options={[
              { value: "original", label: "Original", icon: FileText },
              { value: "adapted", label: "Adapted", icon: Sparkles },
              { value: "compare", label: "Compare", icon: Columns2 },
            ]}
          />
          <div className="settings-wrap">
            <button className="icon-btn" onClick={() => setShowSettings((s) => !s)} aria-expanded={showSettings} aria-label="Reading settings">
              <Settings2 size={20} />
            </button>
            {showSettings && (
              <div className="settings-pop" role="dialog" aria-label="Reading settings">
                <div className="sp-row">
                  <span>Text size</span>
                  <div className="stepper">
                    <button onClick={() => updateSettings({ fontSize: Math.max(15, settings.fontSize - 1) })} aria-label="Smaller text">
                      A−
                    </button>
                    <b>{settings.fontSize}</b>
                    <button onClick={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })} aria-label="Larger text">
                      A+
                    </button>
                  </div>
                </div>
                <div className="sp-row">
                  <span>Line spacing</span>
                  <Segmented
                    size="sm"
                    label="Line spacing"
                    value={settings.lineHeight}
                    onChange={(lineHeight) => updateSettings({ lineHeight })}
                    options={[
                      { value: 1.6, label: "Snug" },
                      { value: 1.8, label: "Comfy" },
                      { value: 2.1, label: "Airy" },
                    ]}
                  />
                </div>
                <label className="sp-row check">
                  <span>High contrast</span>
                  <input type="checkbox" checked={settings.contrast} onChange={(e) => updateSettings({ contrast: e.target.checked })} />
                </label>
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={() => setRightOpen((o) => !o)} aria-label={rightOpen ? "Hide learning tools" : "Show learning tools"} title="Learning tools">
            {rightOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
      </header>

      <div className="ws-body">
        {/* Left: original page */}
        {leftOpen && (
          <aside className="ws-left" aria-label="Original page">
            <h2 className="panel-title">
              <FileText size={16} aria-hidden="true" /> Original page
            </h2>
            {passage.thumb && <img className="orig-thumb" src={passage.thumb} alt="Your original textbook page" />}
            <div className={`orig-text ${reveal ? "reveal-src" : ""}`}>
              {version
                ? version.segments.map((s) => (
                    <span key={s.id} style={{ "--i": s.id }} className={`seg ${hoverSeg === s.id ? "hot" : ""}`} onMouseEnter={() => setHoverSeg(s.id)} onMouseLeave={() => setHoverSeg(null)}>
                      {s.source}{" "}
                    </span>
                  ))
                : passage.originalText}
            </div>
            <p className="panel-hint">Hover a sentence to see where it went in your version.</p>
          </aside>
        )}

        {/* Center */}
        <section className="ws-center" aria-label="Reading">
          {error && (
            <p className="error banner" role="alert">
              {error}
              <button className="icon-btn" onClick={() => setError("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </p>
          )}
          {center === "map" && version ? (
            <article className="reading-card map-card">
              <div className="assess-top">
                <h2>Knowledge map</h2>
                <button className="text-btn" onClick={() => setCenter("read")}>
                  Back to reading
                </button>
              </div>
              <p className="muted">How the key ideas connect. Select a concept to jump to it in the passage.</p>
              <KnowledgeMap concepts={verified} links={version.links} onPick={(c) => jumpTo(findSegment(version.segments, c.adaptedEvidence))} />
            </article>
          ) : (
            <article className={`reading-card ${fade ? "fading" : ""}`} ref={readRef}>
              <div className="reading-meta">
                <span>{findLevel(level).label}</span>
                <span>{langMode === "english" ? "English" : langMode === "bilingual" ? `English + ${lang.native}` : lang.native}</span>
              </div>
              <div className={`reading ${reveal && view === "adapted" ? "reveal" : ""}`}>{renderReading()}</div>
              {version && view === "adapted" && (
                <div className="reading-end">
                  <button className="btn btn-primary" onClick={() => setCenter("map")}>
                    <Network size={18} aria-hidden="true" /> See the knowledge map
                  </button>
                </div>
              )}
            </article>
          )}
        </section>

        {/* Right: learning support */}
        {rightOpen && version && (
          <aside className="ws-right" aria-label="Learning tools">
            <Widget tone="orange" title="Reading level" icon={BookOpen} className="w-level">
              <div className="before-after">
                <div>
                  <b>{before.grade.toFixed(1)}</b>
                  <span>original</span>
                </div>
                <span className="ba-arrow" aria-hidden="true">
                  →
                </span>
                <div>
                  <b className="ba-new">{after.grade.toFixed(1)}</b>
                  <span>adapted</span>
                </div>
              </div>
              <p className="w-note">English readability estimates (Flesch-Kincaid grade), calculated from the actual text.</p>
              <LevelSteps value={level} busyLevel={busy ? busy.replace(language, "") : null} onChange={(l) => switchTo(l, language)} />
            </Widget>

            <Widget tone="peri" title="Language support" icon={Languages} className="w-lang">
              <LanguagePicker value={language} onChange={(l) => switchTo(level, l)} label="Home language" />
              {busy && busy.endsWith(language) === false && (
                <p className="w-note">
                  <Loader2 size={14} className="spin" /> Translating…
                </p>
              )}
              <Segmented
                label="Reading mode"
                size="sm"
                value={langMode}
                onChange={setLangMode}
                options={[
                  { value: "english", label: "English" },
                  { value: "bilingual", label: "Bilingual" },
                  { value: "home", label: lang.native },
                ]}
              />
              {langMode === "english" && (
                <div className="support-levels" role="radiogroup" aria-label="How much help with words">
                  {[
                    { v: "vocab", t: "Word translations", d: `Key words show ${lang.native} under them` },
                    { v: "define", t: "Definitions on tap", d: "Tap a highlighted word for help" },
                    { v: "independent", t: "Independent reading", d: "No highlights, just you and the text" },
                  ].map((o) => (
                    <button key={o.v} role="radio" aria-checked={support === o.v} className={support === o.v ? "on" : ""} onClick={() => setSupport(o.v)}>
                      <span className="radio-dot" />
                      <span>
                        <b>{o.t}</b>
                        <small>{o.d}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Widget>

            <Widget tone="teal" title="Knowledge kept" icon={Check} className="w-retain">
              <div className="retain-top">
                <ProgressRing value={verified.length ? retained / verified.length : 0} size={84} stroke={9} color="#068A73" track="rgba(8,185,154,.18)" label={`${retained} of ${verified.length} key concepts verified`}>
                  <b>
                    {retained}/{verified.length}
                  </b>
                </ProgressRing>
                <div>
                  <p className="retain-big">
                    {retained} of {verified.length} key concepts verified
                  </p>
                  <p className="w-note">Each concept is checked against both texts in your browser.</p>
                </div>
              </div>
              <ul className="concepts">
                {verified.map((c, i) => (
                  <li key={c.name} className={`concept ${c.status}`}>
                    <button aria-expanded={openConcept === i} onClick={() => setOpenConcept(openConcept === i ? null : i)}>
                      <span className="c-status">{c.status === "retained" ? <Check size={14} /> : c.status === "missing" ? <X size={14} /> : "?"}</span>
                      <span>{c.name}</span>
                      <ChevronRight size={16} className="chev" aria-hidden="true" />
                    </button>
                    {openConcept === i && (
                      <div className="evidence">
                        <p>
                          <small>Original</small>"{c.sourceEvidence}"
                        </p>
                        <p>
                          <small>Your version</small>
                          {c.adaptedEvidence ? `"${c.adaptedEvidence}"` : "Not covered"}
                        </p>
                        <p className="w-note">{c.note}</p>
                        {c.adaptedEvidence && (
                          <button className="text-btn" onClick={() => jumpTo(findSegment(version.segments, c.adaptedEvidence))}>
                            Show me in the passage
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <button className="btn btn-secondary btn-sm full" onClick={() => setCenter("map")}>
                <Network size={16} aria-hidden="true" /> Open knowledge map
              </button>
            </Widget>

            {word && (
              <Widget
                tone="sun"
                title="Word explorer"
                icon={Star}
                className="w-words"
                action={
                  <div className="pager">
                    <button className="icon-btn sm" onClick={() => setWordIdx((wordIdx - 1 + vocab.length) % vocab.length)} aria-label="Previous word">
                      <ChevronLeft size={16} />
                    </button>
                    <span>
                      {wordIdx + 1}/{vocab.length}
                    </span>
                    <button className="icon-btn sm" onClick={() => setWordIdx((wordIdx + 1) % vocab.length)} aria-label="Next word">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                }
              >
                <p className="we-word">{word.word}</p>
                <p className="we-trans" lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>
                  {word.translation}
                </p>
                <p className="we-def">"{word.definition}"</p>
                {word.example && <p className="we-ex">{word.example}</p>}
                <button className={`btn btn-sm ${isWordSaved(word.word) ? "btn-secondary" : "btn-primary"}`} onClick={() => toggleWord(word, { language, passageId: passage.id, title: passage.title })}>
                  {isWordSaved(word.word) ? (
                    <>
                      <Check size={16} aria-hidden="true" /> Saved
                    </>
                  ) : (
                    <>
                      <Star size={16} aria-hidden="true" /> Save word
                    </>
                  )}
                </button>
              </Widget>
            )}
          </aside>
        )}
      </div>

      {pop && (
        <div className="vocab-pop" style={{ top: pop.top, left: pop.left }} role="dialog" aria-label={`Meaning of ${pop.entry.word}`} onClick={(e) => e.stopPropagation()}>
          <div className="vp-head">
            <b>{pop.entry.word}</b>
            <button className="icon-btn sm" onClick={() => setPop(null)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <p>{pop.entry.definition}</p>
          <p className="vp-trans" lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>
            <b>{pop.entry.translation}</b>
            {pop.entry.definitionTranslated && ` · ${pop.entry.definitionTranslated}`}
          </p>
          {pop.entry.example && <p className="vp-ex">{pop.entry.example}</p>}
          <button className="btn btn-sm btn-secondary" onClick={() => toggleWord(pop.entry, { language, passageId: passage.id, title: passage.title })}>
            {isWordSaved(pop.entry.word) ? (
              <>
                <Check size={14} aria-hidden="true" /> Saved
              </>
            ) : (
              <>
                <Star size={14} aria-hidden="true" /> Save to vocabulary
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
