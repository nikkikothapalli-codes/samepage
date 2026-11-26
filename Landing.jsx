import { useEffect, useState } from "react";
import { BookOpen, Camera, CheckCircle2, Ear, Highlighter, Languages, Layers, PlayCircle, Sparkles } from "lucide-react";
import Logo from "./Logo.jsx";
import { HeroArt } from "./Illustrations.jsx";
import TextbookSpread from "./TextbookSpread.jsx";
import { openDemo } from "./passages.js";

// "Photosynthesis" in some of the languages SamePage explains things in.
const WORDS = [
  { w: "photosynthesis", lang: "en" },
  { w: "fotosíntesis", lang: "es" },
  { w: "光合作用", lang: "zh" },
  { w: "التمثيل الضوئي", lang: "ar", rtl: true },
  { w: "quang hợp", lang: "vi" },
  { w: "usanisinuru", lang: "sw" },
  { w: "प्रकाश संश्लेषण", lang: "hi" },
  { w: "fotossíntese", lang: "pt" },
];

function WordCycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 1600);
    return () => clearInterval(t);
  }, []);
  const w = WORDS[i];
  return (
    <p className="word-cycle" aria-label="Photosynthesis, in many languages">
      One idea, every language:
      <b key={i} lang={w.lang} dir={w.rtl ? "rtl" : "ltr"} aria-hidden="true">
        {w.w}
      </b>
    </p>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="land-nav">
        <Logo />
        <nav aria-label="Landing">
          <a href="#how">How it works</a>
          <a href="#impact">Impact</a>
          <a className="btn btn-secondary btn-sm" href="#/home">
            Open the app
          </a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-top">
          <h1>
            <span className="h1-a">Different learners<span className="dot">.</span></span>
            <span className="h1-b">
              Same possibilities<span className="dot">.</span>
              <svg className="h1-underline" viewBox="0 0 600 30" preserveAspectRatio="none" aria-hidden="true">
                <path d="M6 20 C 120 8, 260 26, 400 14 S 560 10, 594 16" />
              </svg>
            </span>
          </h1>
          <div className="hero-side">
            <WordCycle />
            <p className="hero-lede">The world doesn't learn in one language or at one reading level. Why should its textbooks?</p>
            <div className="hero-ctas">
              <a className="btn btn-primary btn-lg" href="#/adapt">
                <Sparkles size={18} aria-hidden="true" /> Adapt a textbook
              </a>
              <button className="btn btn-ghost btn-lg" onClick={openDemo}>
                <PlayCircle size={18} aria-hidden="true" /> Explore a demo
              </button>
            </div>
          </div>
        </div>
        <TextbookSpread />
        <p className="spread-caption">Drag the support level or pick a language. Same page, same facts, a version you can actually read.</p>
        <div className="feature-strip">
          <div className="fs-blue">
            <BookOpen size={18} aria-hidden="true" /> Read real textbooks
          </div>
          <div className="fs-orange">
            <Layers size={18} aria-hidden="true" /> 5 levels of support
          </div>
          <div className="fs-sun">
            <Highlighter size={18} aria-hidden="true" /> Tap any hard word
          </div>
          <div className="fs-peri">
            <Languages size={18} aria-hidden="true" /> 26 home languages
          </div>
          <div className="fs-teal">
            <CheckCircle2 size={18} aria-hidden="true" /> Every key idea checked
          </div>
        </div>
      </section>

      <section className="how" id="how" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="how-grid">
          <li className="how-card tone-lilac">
            <span className="how-num">1</span>
            <Camera size={28} aria-hidden="true" />
            <h3>Capture</h3>
            <p>Upload or photograph any textbook page. Donated books, class handouts and free online chapters all work.</p>
          </li>
          <li className="how-card tone-peach">
            <span className="how-num">2</span>
            <Layers size={28} aria-hidden="true" />
            <h3>Adapt</h3>
            <p>Choose how much language support you want and which language should explain the hard parts.</p>
          </li>
          <li className="how-card tone-sage">
            <span className="how-num">3</span>
            <Ear size={28} aria-hidden="true" />
            <h3>Understand</h3>
            <p>Read it your way: tap hard words, switch to bilingual, compare with the original, and see that every key idea is still there.</p>
          </li>
        </ol>
      </section>

      <section className="impact" id="impact" aria-labelledby="impact-title">
        <div className="impact-art">
          <HeroArt />
        </div>
        <div className="impact-copy">
          <h2 id="impact-title">Built for the same lesson, everywhere<span className="dot">.</span></h2>
          <p>
            Most of the world's free and donated learning material is written in English, at a level that assumes you grew up speaking it. SamePage keeps students in the
            same lesson as everyone else instead of handing them an easier one.
          </p>
          <div className="sdg-row">
            <div className="sdg">
              <span className="sdg-num" style={{ background: "#C5192D" }}>
                4
              </span>
              <div>
                <h3>Quality Education</h3>
                <p>Inclusive, equitable access to the same grade-level content.</p>
              </div>
            </div>
            <div className="sdg">
              <span className="sdg-num" style={{ background: "#DD1367" }}>
                10
              </span>
              <div>
                <h3>Reduced Inequalities</h3>
                <p>A student's first language shouldn't decide what they get to learn.</p>
              </div>
            </div>
          </div>
          <p className="fine">SamePage is a student hackathon project that supports these goals. It is not affiliated with or endorsed by the United Nations.</p>
        </div>
      </section>

      <footer className="land-foot">
        <Logo />
        <p>Different learners. Same possibilities.</p>
        <a className="btn btn-primary" href="#/adapt">
          Adapt a textbook
        </a>
      </footer>
    </div>
  );
}
