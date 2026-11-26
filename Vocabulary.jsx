import { useState } from "react";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { setMastery, toggleWord, useStore } from "./store.js";
import { findLang } from "./constants.js";
import { BookArt } from "./Illustrations.jsx";
import { EmptyState, Segmented } from "./ui.jsx";

const MASTERY = { new: "New", learning: "Learning", known: "Know it" };

export default function Vocabulary() {
  const { vocab } = useStore();
  const [mode, setMode] = useState("cards");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const queue = [...vocab].sort((a, b) => ({ new: 0, learning: 1, known: 2 })[a.mastery] - ({ new: 0, learning: 1, known: 2 })[b.mastery]);
  const card = queue[i % Math.max(1, queue.length)];

  function rate(m) {
    setMastery(card.word, m);
    setFlipped(false);
    setI((n) => n + 1);
  }

  return (
    <div className="page">
      <header className="page-head row-between">
        <div>
          <h1>Vocabulary</h1>
          <p>Words you saved while reading. Flip a card to check yourself.</p>
        </div>
        {vocab.length > 0 && (
          <Segmented label="View" value={mode} onChange={setMode} options={[{ value: "cards", label: "Flashcards" }, { value: "list", label: "All words" }]} />
        )}
      </header>

      {!vocab.length ? (
        <EmptyState illustration={<BookArt />} title="No saved words yet." action={<a className="btn btn-primary" href="#/library">Open a page</a>}>
          While reading, tap a highlighted word and choose "Save to vocabulary".
        </EmptyState>
      ) : mode === "cards" ? (
        <div className="flash-wrap">
          <div className="mastery-row">
            {Object.entries(MASTERY).map(([k, v]) => (
              <span key={k} className={`m-pill m-${k}`}>
                {v}: {vocab.filter((w) => w.mastery === k).length}
              </span>
            ))}
          </div>
          <button className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Show the word" : "Show the meaning"}>
            <div className="fc-face fc-front">
              <span className="fc-tag">{MASTERY[card.mastery]}</span>
              <b>{card.word}</b>
              <small>Tap to see the meaning</small>
            </div>
            <div className="fc-face fc-back">
              <b className="fc-trans" lang={findLang(card.language).code} dir={findLang(card.language).rtl ? "rtl" : "ltr"}>
                {card.translation}
              </b>
              <p>{card.definition}</p>
              {card.example && <p className="fc-ex">{card.example}</p>}
            </div>
          </button>
          <div className="row center">
            <button className="btn btn-ghost" onClick={() => rate("learning")}>
              <RotateCcw size={16} aria-hidden="true" /> Still learning
            </button>
            <button className="btn btn-primary" onClick={() => rate("known")}>
              <Check size={16} aria-hidden="true" /> I know it
            </button>
          </div>
          <p className="muted small center">
            Card {(i % queue.length) + 1} of {queue.length}
          </p>
        </div>
      ) : (
        <div className="word-grid">
          {vocab.map((w) => (
            <article key={w.word} className="word-card">
              <div className="row-between">
                <b>{w.word}</b>
                <span className={`m-pill m-${w.mastery}`}>{MASTERY[w.mastery]}</span>
              </div>
              <p className="wc-trans" lang={findLang(w.language).code} dir={findLang(w.language).rtl ? "rtl" : "ltr"}>
                {w.translation}
              </p>
              <p>{w.definition}</p>
              {w.example && <p className="fc-ex">{w.example}</p>}
              <div className="row-between">
                <small className="muted">From {w.title}</small>
                <button className="icon-btn sm" onClick={() => toggleWord(w)} aria-label={`Remove ${w.word}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
