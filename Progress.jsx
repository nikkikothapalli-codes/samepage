import { useStore } from "./store.js";
import { findLevel } from "./constants.js";
import { readability } from "./readability.js";
import { adaptedText } from "./api.js";
import { versionKey } from "./passages.js";
import { StepsArt } from "./Illustrations.jsx";
import { EmptyState, ProgressRing, Widget } from "./ui.jsx";

export default function Progress() {
  const { passages, vocab } = useStore();

  if (!passages.length) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>My Progress</h1>
        </header>
        <EmptyState illustration={<StepsArt />} title="Your progress starts with your first page." action={<a className="btn btn-primary" href="#/adapt">Adapt a page</a>}>
          Every page you adapt shows up here.
        </EmptyState>
      </div>
    );
  }

  const known = vocab.filter((v) => v.mastery === "known").length;
  const levels = passages.map((p) => {
    const v = p.versions[versionKey(p.level, p.language)];
    return { title: p.title, level: findLevel(p.level).label, before: readability(p.originalText).grade, after: v ? readability(adaptedText(v.segments)).grade : null };
  });
  const langs = new Set(passages.map((p) => p.language)).size;

  return (
    <div className="page">
      <header className="page-head">
        <h1>My Progress</h1>
        <p>Everything here comes from the pages you've actually read.</p>
      </header>
      <div className="bento progress-bento">
        <Widget tone="solid-teal" title="Pages adapted">
          <p className="stat-num">{passages.length}</p>
        </Widget>
        <Widget tone="solid-sun" title="Words you know">
          <div className="stat-ring">
            <ProgressRing value={vocab.length ? known / vocab.length : 0} color="#292C47" track="rgba(41,44,71,.15)" label={`${known} of ${vocab.length} words known`}>
              <b>{known}</b>
            </ProgressRing>
            <p className="stat-sub">of {vocab.length} saved words</p>
          </div>
        </Widget>
        <Widget tone="solid-peri" title="Home languages used">
          <p className="stat-num peach">{langs}</p>
        </Widget>
      </div>
      <section className="continue">
        <h2>Reading levels</h2>
        <table className="level-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">Support</th>
              <th scope="col">Original</th>
              <th scope="col">Your version</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l, i) => (
              <tr key={i}>
                <td>{l.title}</td>
                <td>{l.level}</td>
                <td>Grade {l.before.toFixed(1)}</td>
                <td>{l.after !== null ? `Grade ${l.after.toFixed(1)}` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
