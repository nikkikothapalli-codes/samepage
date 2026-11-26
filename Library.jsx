import { useState } from "react";
import { ArrowRight, BookmarkCheck, PlayCircle, Search, Sparkles, Trash2 } from "lucide-react";
import { deletePassage, useStore } from "./store.js";
import { findLang, findLevel, subjectStyle } from "./constants.js";
import { BookArt, SubjectArt } from "./Illustrations.jsx";
import { EmptyState } from "./ui.jsx";
import { openDemo } from "./passages.js";

const ago = (t) => {
  if (!t) return "";
  const d = Math.round((Date.now() - t) / 86400000);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
};

export default function LibraryPage() {
  const { passages } = useStore();
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("All");
  const subjects = ["All", ...new Set(passages.map((p) => p.subject))];
  const list = passages
    .filter((p) => (subject === "All" || p.subject === subject) && (p.title + " " + p.subject).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));

  return (
    <div className="page">
      <header className="page-head row-between">
        <div>
          <h1>My Library</h1>
          <p>Every page you've adapted, ready to pick back up.</p>
        </div>
        <a className="btn btn-primary" href="#/adapt">
          <Sparkles size={18} aria-hidden="true" /> Adapt a page
        </a>
      </header>

      {passages.length === 0 ? (
        <EmptyState
          illustration={<BookArt />}
          title="Your library is empty."
          action={
            <div className="row">
              <a className="btn btn-primary" href="#/adapt">Adapt your first page</a>
              <button className="btn btn-ghost" onClick={openDemo}>
                <PlayCircle size={18} aria-hidden="true" /> Open the demo lesson
              </button>
            </div>
          }
        >
          Pages you adapt are saved in this browser.
        </EmptyState>
      ) : (
        <>
          <div className="filters">
            <label className="search">
              <Search size={18} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your pages" aria-label="Search your pages" />
            </label>
            <div className="chips" role="radiogroup" aria-label="Subject">
              {subjects.map((s) => (
                <button key={s} role="radio" aria-checked={subject === s} className={`chip ${subject === s ? "on" : ""}`} onClick={() => setSubject(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="library-grid">
            {list.map((p, i) => {
              const st = subjectStyle(p.subject);
              return (
                <article key={p.id} className={`lib-card ${i === 0 ? "featured" : ""}`} style={{ "--subj": st.color, "--subj-ink": st.ink, "--subj-tint": st.tint }}>
                  <div className="lib-art">
                    {p.thumb ? <img src={p.thumb} alt="" /> : <SubjectArt subject={p.subject} size={i === 0 ? 96 : 64} />}
                    {p.bookmarked && <BookmarkCheck className="lib-mark" size={20} aria-label="Bookmarked" />}
                  </div>
                  <div className="lib-body">
                    <span className="lesson-subject">{p.subject}</span>
                    <h3>{p.title}</h3>
                    <p className="lesson-meta">
                      {findLevel(p.level).label} · {findLang(p.language).native} · {ago(p.lastOpened)}
                    </p>
                    <div className="lesson-foot">
                      <span className="status done">{Object.keys(p.versions || {}).length} version{Object.keys(p.versions || {}).length === 1 ? "" : "s"} saved</span>
                      <div className="row">
                        <button className="icon-btn sm" onClick={() => confirm(`Remove "${p.title}" from your library?`) && deletePassage(p.id)} aria-label={`Remove ${p.title}`}>
                          <Trash2 size={16} />
                        </button>
                        <a className="btn btn-secondary btn-sm" href={`#/read/${p.id}`}>
                          Open <ArrowRight size={16} aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {!list.length && <p className="muted">No pages match that search.</p>}
          </div>
        </>
      )}
    </div>
  );
}
