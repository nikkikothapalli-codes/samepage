// Concepts as colored nodes on a ring, linked by how they relate.
// Clicking a node jumps to where the passage explains it.
const COLORS = ["#08B99A", "#2959F3", "#FF8900", "#9D8BF5", "#FF554D", "#FFC524"];

export default function KnowledgeMap({ concepts, links, onPick }) {
  const W = 520;
  const H = 340;
  const cx = W / 2;
  const cy = H / 2;
  const n = concepts.length;
  const pos = concepts.map((c, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { ...c, x: cx + Math.cos(a) * 180, y: cy + Math.sin(a) * 120, color: COLORS[i % COLORS.length] };
  });
  const byName = (name) => pos.find((p) => p.name.toLowerCase() === name.toLowerCase());

  return (
    <svg className="kmap" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Knowledge map of key concepts">
      {links.map((l, i) => {
        const a = byName(l.from);
        const b = byName(l.to);
        if (!a || !b) return null;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C9CEDD" strokeWidth="2" />
            {l.label && (
              <text x={mx} y={my - 6} textAnchor="middle" className="kmap-label">
                {l.label}
              </text>
            )}
          </g>
        );
      })}
      {pos.map((p) => (
        <g
          key={p.name}
          className={`kmap-node status-${p.status || "retained"}`}
          transform={`translate(${p.x} ${p.y})`}
          tabIndex={0}
          role="button"
          aria-label={`${p.name}. Jump to it in the passage.`}
          onClick={() => onPick(p)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(p))}
        >
          <rect x={-Math.min(90, p.name.length * 4.4 + 18)} y="-17" width={Math.min(180, p.name.length * 8.8 + 36)} height="34" rx="17" fill="#fff" stroke={p.color} strokeWidth="2.5" />
          <circle cx={-Math.min(90, p.name.length * 4.4 + 18) + 15} cy="0" r="5" fill={p.color} />
          <text x="6" y="5" textAnchor="middle" className="kmap-text">
            {p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
