// SamePage illustration system: flat, editorial SVGs in the brand palette.
// Motifs: overlapping textbook pages, abstract learners, paths that converge, stepping stones.
const P = { plum: "#292C47", papaya: "#FF554D", marigold: "#FFC524", lilac: "#E1E8FE", lilacDeep: "#9D8BF5", sage: "#DDF6F0", sageDeep: "#08B99A", peach: "#FFEBD3", butter: "#FFF4CF", oat: "#F5F7FA", ink: "#292C47", blue: "#2959F3", orange: "#FF8900" };

const Lines = ({ x, y, w, n = 5, gap = 12, color = "#D8D0E4", hl }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * 0.6 : w - (i % 2) * 14} height="4" rx="2" fill={color} />
    ))}
    {hl && <rect x={x + hl[0]} y={y + hl[1] * gap - 3} width={hl[2]} height="10" rx="3" fill={P.marigold} opacity=".85" />}
  </g>
);

const Learner = ({ x, y, body, head = P.ink, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-22 40 C -22 12, 22 12, 22 40 Z" fill={body} />
    <circle cx="0" cy="0" r="11" fill={head} />
  </g>
);

export function HeroArt() {
  return (
    <svg viewBox="0 0 520 460" className="art" role="img" aria-label="Three different learners on different paths that meet at the same open book">
      <circle cx="380" cy="120" r="96" fill={P.lilacDeep} opacity=".35" />
      <circle cx="120" cy="360" r="70" fill={P.sageDeep} opacity=".25" />
      {/* pages */}
      <g transform="rotate(-9 300 170)">
        <rect x="222" y="70" width="170" height="210" rx="14" fill={P.peach} />
        <Lines x={244} y={102} w={124} n={8} gap={18} color="#F3B9A6" />
      </g>
      <g transform="rotate(5 330 180)">
        <rect x="262" y="62" width="176" height="220" rx="14" fill="#fff" stroke={P.plum} strokeOpacity=".12" />
        <Lines x={284} y={96} w={130} n={9} gap={18} hl={[30, 3, 64]} />
        <rect x="284" y="96" width="70" height="8" rx="4" fill={P.plum} />
      </g>
      {/* converging paths */}
      <path d="M70 420 C 120 330, 220 330, 300 262" fill="none" stroke={P.papaya} strokeWidth="14" strokeLinecap="round" />
      <path d="M210 440 C 230 360, 270 330, 312 270" fill="none" stroke={P.blue} strokeWidth="14" strokeLinecap="round" />
      <path d="M360 440 C 350 380, 340 330, 326 274" fill="none" stroke={P.orange} strokeWidth="14" strokeLinecap="round" />
      <circle cx="316" cy="266" r="16" fill={P.marigold} stroke="#fff" strokeWidth="5" />
      {/* learners */}
      <Learner x={70} y={382} body={P.papaya} />
      <Learner x={210} y={404} body={P.blue} head="#7A5A3A" s={0.9} />
      <Learner x={362} y={400} body={P.orange} head="#4A3426" s={1.05} />
      <path d="M440 210 l8 -18 l8 18 l18 8 l-18 8 l-8 18 l-8 -18 l-18 -8 z" fill={P.marigold} />
    </svg>
  );
}

export function PagesArt() {
  return (
    <svg viewBox="0 0 300 220" className="art" aria-hidden="true">
      <g transform="rotate(-10 150 110)">
        <rect x="70" y="30" width="120" height="160" rx="12" fill="#2959F3" />
        <Lines x={88} y={58} w={84} n={7} gap={16} color="#6E8FF7" />
      </g>
      <g transform="rotate(6 170 110)">
        <rect x="110" y="22" width="130" height="170" rx="12" fill="#fff" />
        <Lines x={128} y={52} w={92} n={8} gap={16} hl={[18, 2, 46]} />
        <rect x="128" y="128" width="40" height="10" rx="3" fill={P.lilacDeep} opacity=".7" />
      </g>
      <path d="M20 200 C 80 170, 120 190, 160 150" stroke={P.papaya} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M40 220 C 100 200, 150 210, 200 170" stroke={P.marigold} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M280 210 C 250 190, 230 190, 214 168" stroke={P.sageDeep} strokeWidth="9" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ScanArt() {
  return (
    <svg viewBox="0 0 140 120" className="art" aria-hidden="true">
      <rect x="20" y="22" width="78" height="92" rx="8" fill="#fff" transform="rotate(-6 59 68)" />
      <Lines x={32} y={40} w={52} n={5} gap={12} />
      <rect x="62" y="8" width="58" height="104" rx="12" fill={P.plum} />
      <rect x="68" y="18" width="46" height="80" rx="6" fill={P.lilac} />
      <rect x="68" y="54" width="46" height="4" fill={P.papaya} />
      <path d="M72 26 h8 M72 26 v8 M110 26 h-8 M110 26 v8 M72 90 h8 M72 90 v-8 M110 90 h-8 M110 90 v-8" stroke={P.plum} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PasteArt() {
  return (
    <svg viewBox="0 0 140 120" className="art" aria-hidden="true">
      <rect x="34" y="16" width="76" height="98" rx="10" fill={P.plum} />
      <rect x="42" y="26" width="60" height="80" rx="6" fill="#fff" />
      <rect x="56" y="10" width="32" height="14" rx="5" fill={P.papaya} />
      <Lines x={50} y={40} w={44} n={5} gap={12} hl={[0, 1, 26]} />
    </svg>
  );
}

export function StepsArt() {
  return (
    <svg viewBox="0 0 220 150" className="art" aria-hidden="true">
      <rect x="10" y="118" width="54" height="18" rx="9" fill="#2959F3" />
      <rect x="70" y="94" width="54" height="18" rx="9" fill="#9D8BF5" />
      <rect x="130" y="70" width="54" height="18" rx="9" fill={P.papaya} />
      <rect x="180" y="46" width="34" height="18" rx="9" fill={P.marigold} />
      <Learner x={152} y={30} body={P.marigold} head="#fff" s={0.7} />
      <path d="M190 18 l5 -10 l5 10 l10 5 l-10 5 l-5 10 l-5 -10 l-10 -5 z" fill={P.marigold} />
    </svg>
  );
}

export function BookArt() {
  return (
    <svg viewBox="0 0 160 110" className="art" aria-hidden="true">
      <ellipse cx="80" cy="100" rx="64" ry="7" fill="rgba(70,38,107,.08)" />
      <path d="M80 26 C 60 14, 30 14, 14 20 L 14 92 C 30 86, 60 86, 80 96 Z" fill="#fff" stroke={P.plum} strokeWidth="3" />
      <path d="M80 26 C 100 14, 130 14, 146 20 L 146 92 C 130 86, 100 86, 80 96 Z" fill={P.lilac} stroke={P.plum} strokeWidth="3" />
      <rect x="112" y="10" width="14" height="40" fill={P.papaya} />
      <path d="M112 50 l7 -7 l7 7 z" fill={P.lilac} />
      <Lines x={26} y={36} w={42} n={4} gap={12} />
    </svg>
  );
}

const SUBJECT_ART = {
  Science: (
    <>
      <circle cx="40" cy="40" r="26" fill={P.sageDeep} opacity=".35" />
      <path d="M32 18 h16 M36 18 v18 l-14 24 h36 l-14 -24 v-18" fill="#fff" stroke="#2F5A35" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 52 h24" stroke="#2F5A35" strokeWidth="3" />
      <circle cx="40" cy="57" r="3" fill={P.papaya} />
    </>
  ),
  History: (
    <>
      <circle cx="40" cy="40" r="26" fill={P.papaya} opacity=".25" />
      <path d="M20 30 L40 18 L60 30 Z M22 62 h36 M26 32 v26 M36 32 v26 M46 32 v26 M56 32 v26" stroke="#8A3B26" strokeWidth="3" fill="#fff" strokeLinejoin="round" />
    </>
  ),
  Geography: (
    <>
      <circle cx="40" cy="40" r="24" fill="#fff" stroke={P.plum} strokeWidth="3" />
      <path d="M20 34 C 30 30, 34 40, 44 36 S 56 30, 62 36 M26 52 C 34 48, 40 54, 52 50" stroke={P.papaya} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  Math: (
    <>
      <rect x="16" y="16" width="26" height="26" rx="5" fill={P.marigold} />
      <circle cx="54" cy="30" r="12" fill={P.papaya} opacity=".8" />
      <path d="M24 64 L40 44 L56 64 Z" fill={P.plum} />
    </>
  ),
  Literature: (
    <>
      <path d="M40 22 C 32 16, 20 16, 14 19 L 14 60 C 20 57, 32 57, 40 63 C 48 57, 60 57, 66 60 L 66 19 C 60 16, 48 16, 40 22 Z" fill="#fff" stroke="#8A3B26" strokeWidth="3" />
      <path d="M40 22 V63" stroke="#8A3B26" strokeWidth="3" />
    </>
  ),
};

export function SubjectArt({ subject, size = 64 }) {
  const art = SUBJECT_ART[subject] || SUBJECT_ART[subject === "Biology" || subject === "Health" ? "Science" : subject === "Civics" ? "History" : "Literature"];
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className="subject-art" aria-hidden="true">
      {art}
    </svg>
  );
}

// Processing: a dense page turning into an easier one.
export function TransformArt({ stage }) {
  return (
    <svg viewBox="0 0 360 200" className={`art transform-art stage-${stage}`} aria-hidden="true">
      <g className="t-src">
        <rect x="20" y="20" width="130" height="160" rx="12" fill="#fff" stroke={P.plum} strokeOpacity=".15" />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x="34" y={38 + i * 12} width={i % 3 === 2 ? 70 : 102} height="3" rx="1.5" fill="#CFC6DA" />
        ))}
        <rect className="t-scan" x="26" y="30" width="118" height="6" rx="3" fill={P.papaya} opacity=".55" />
      </g>
      <g className="t-flow">
        <path d="M156 90 C 180 70, 190 110, 208 90" stroke={P.lilacDeep} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M156 104 C 180 84, 190 124, 208 104" stroke={P.papaya} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M156 118 C 180 98, 190 138, 208 118" stroke={P.marigold} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <g className="t-out">
        <rect x="214" y="20" width="130" height="160" rx="12" fill="#fff" stroke={P.plum} strokeOpacity=".15" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} className="t-line" style={{ animationDelay: `${i * 0.18}s` }} x="230" y={44 + i * 20} width={i % 2 ? 72 : 96} height="6" rx="3" fill="#CFC6DA" />
        ))}
        <rect className="t-hl" x="254" y="61" width="40" height="12" rx="3" fill={P.marigold} />
        <rect className="t-hl" x="232" y="121" width="34" height="12" rx="3" fill={P.marigold} />
        <circle className="t-check" cx="326" cy="40" r="11" fill={P.sageDeep} />
        <path className="t-check" d="M320 40 l4 4 l8 -8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function MissionArt() {
  return (
    <svg viewBox="0 0 260 200" className="art" aria-hidden="true">
      <circle cx="130" cy="100" r="80" fill="none" stroke={P.lilacDeep} strokeWidth="2" strokeDasharray="4 8" />
      <circle cx="130" cy="100" r="46" fill={P.lilac} />
      <path d="M130 70 C 116 62, 100 62, 92 66 L 92 128 C 100 124, 116 124, 130 132 C 144 124, 160 124, 168 128 L 168 66 C 160 62, 144 62, 130 70 Z" fill="#fff" stroke={P.plum} strokeWidth="3" />
      <path d="M130 70 V132" stroke={P.plum} strokeWidth="3" />
      {[
        [50, 40, P.papaya],
        [214, 52, P.sageDeep],
        [44, 160, P.marigold],
        [220, 156, P.plum],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <path d={`M${x} ${y} Q ${(x + 130) / 2} ${(y + 100) / 2 + (i % 2 ? 20 : -20)} ${x < 130 ? 92 : 168} ${100}`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
          <circle cx={x} cy={y} r="12" fill={c} />
        </g>
      ))}
    </svg>
  );
}
