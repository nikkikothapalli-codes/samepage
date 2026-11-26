import { ArrowRight, ArrowUpRight, BookOpen, Camera, ClipboardPaste, PlayCircle } from "lucide-react";
import { useStore } from "./store.js";
import { findLang, findLevel, subjectStyle } from "./constants.js";
import { BookArt, PagesArt, PasteArt, ScanArt, StepsArt, SubjectArt } from "./Illustrations.jsx";
import { Bars, EmptyState } from "./ui.jsx";
import { openDemo, versionKey } from "./passages.js";
import { readability } from "./readability.js";
import { adaptedText } from "./api.js";

const startAdapt = (mode) => {
  try {
    sessionStorage.setItem("samepage:mode", mode);
  } catch {}
  window.location.hash = "/adapt";
};

export default function Dashboard() {
  const { passages, vocab } = useStore();

  // Words saved in each of the last 7 days.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const next = d.getTime() + 86400000;
    return { label: d.toLocaleDateString(undefined, { weekday: "narrow" }), value: vocab.filter((v) => v.savedAt >= d.getTime() && v.savedAt < next).length };
  });

  // Real reading-level drops for each saved page (original vs the version the student reads).
  const drops = passages
    .map((p) => {
      const v = p.versions?.[versionKey(p.level, p.language)];
      if (!v) return null;
      const before = readability(p.originalText).grade;
      const after = readability(adaptedText(v.segments)).grade;
      return { title: p.title, before, after };
    })
    .filter(Boolean);
  const avgDrop = drops.length ? drops.reduce((s, d) => s + Math.max(0, d.before - d.after), 0) / drops.length : null;
  const langs = new Set(passages.map((p) => p.language));
  const recent = [...passages].sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0)).slice(0, 3);

  return (
    <div className="page dashboard">
      <header className="page-head">
        <h1>Learning without limits<span className="dot">.</span></h1>
        <p>Your knowledge. Your level. Your language.</p>
      </header>

      <div className="bento">
        <section className="widget tone-solid-teal b-hero">
          <div className="b-hero-copy">
            <h2>
              Different learners<span className="dot">.</span>
              <br />
              Same possibilities<span className="dot">.</span>
            </h2>
            <p>Make any textbook work for you.</p>
            <a className="btn btn-ink btn-lg" href="#/adapt">
              Adapt a page <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <PagesArt />
        </section>

        <button className="widget tone-solid-blue b-quick" onClick={() => startAdapt("photo")}>
          <ScanArt />
          <div>
            <h3>
              <Camera size={18} aria-hidden="true" /> Scan a page
            </h3>
            <p>From your textbook</p>
          </div>
        </button>

        <button className="widget tone-solid-orange b-quick" onClick={() => startAdapt("paste")}>
          <PasteArt />
          <div>
            <h3>
              <ClipboardPaste size={18} aria-hidden="true" /> Paste a passage
            </h3>
            <p>From any source</p>
          </div>
        </button>

        <section className="widget tone-solid-sun b-stat">
          <h3>Words discovered</h3>
          <p className="stat-num">{vocab.length}</p>
          <p className="stat-sub">{vocab.length ? "saved to your vocabulary" : "Tap a highlighted word while reading and save it."}</p>
          <Bars data={days} color="#292C47" label="Words saved in the last 7 days" />
        </section>

        <section className="widget tone-solid-peri b-stat">
          <h3>Pages adapted</h3>
          <p className="stat-num butter">{passages.length}</p>
          <p className="stat-sub">
            {passages.length ? `in ${langs.size} home language${langs.size === 1 ? "" : "s"}` : "Your first page is one photo away."}
          </p>
        </section>

        <section className="widget tone-white b-journey">
          <h3>Reading made easier</h3>
          {!drops.length ? (
            <div className="journey-empty">
              <StepsArt />
              <p className="stat-sub">Adapt a page to see how much easier it became to read.</p>
            </div>
          ) : (
            <div className="drops">
              <p className="drop-big">
                <b>{avgDrop.toFixed(1)}</b> grade levels easier on average
              </p>
              <ul className="drop-list">
                {drops.slice(0, 4).map((d, i) => (
                  <li key={i}>
                    <span className="drop-title">{d.title}</span>
                    <span className="drop-bar">
                      <span className="drop-before" style={{ width: `${Math.min(100, (d.before / 14) * 100)}%` }} />
                      <span className="drop-after" style={{ width: `${Math.min(100, (d.after / 14) * 100)}%` }} />
                    </span>
                    <span className="drop-nums">
                      {d.before.toFixed(1)} → {d.after.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="stat-sub">Flesch-Kincaid grade, original vs your version</p>
            </div>
          )}
        </section>
      </div>

      <section className="continue">
        <div className="section-head">
          <h2>Continue learning</h2>
          {passages.length > 0 && <a href="#/library">See library</a>}
        </div>
        {recent.length ? (
          <div className="lesson-row">
            {recent.map((p) => {
              const st = subjectStyle(p.subject);
              return (
                <article key={p.id} className="lesson-card" style={{ "--subj": st.color, "--subj-ink": st.ink, "--subj-tint": st.tint }}>
                  <div className="lesson-art">
                    <SubjectArt subject={p.subject} />
                  </div>
                  <span className="lesson-subject">{p.subject}</span>
                  <h3>{p.title}</h3>
                  <p className="lesson-meta">
                    {p.subject} · English + {findLang(p.language).name} · {findLevel(p.level).label}
                  </p>
                  <div className="lesson-foot">
                    <span className="status done">{p.bookmarked ? "Bookmarked" : "Saved"}</span>
                    <a className="btn btn-secondary btn-sm" href={`#/read/${p.id}`}>
                      Continue <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            illustration={<BookArt />}
            title="Your adapted pages will live here."
            action={
              <div className="row">
                <a className="btn btn-primary" href="#/adapt">
                  <BookOpen size={18} aria-hidden="true" /> Adapt your first page
                </a>
                <button className="btn btn-ghost" onClick={openDemo}>
                  <PlayCircle size={18} aria-hidden="true" /> Try the demo lesson
                </button>
              </div>
            }
          >
            Start with a page you're stuck on, or open the photosynthesis demo.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
