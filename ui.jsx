// Shared SamePage components. Styling lives in styles.css tokens; components only pick variants.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { LANGUAGES, LEVELS, findLang } from "./constants.js";

export function Button({ variant = "primary", size, icon: Icon, children, className = "", ...rest }) {
  return (
    <button className={`btn btn-${variant} ${size ? `btn-${size}` : ""} ${className}`} {...rest}>
      {Icon && <Icon size={18} strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function LinkButton({ variant = "primary", icon: Icon, children, href, className = "" }) {
  return (
    <a className={`btn btn-${variant} ${className}`} href={href}>
      {Icon && <Icon size={18} strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </a>
  );
}

export function Widget({ tone = "white", title, icon: Icon, action, className = "", children, ...rest }) {
  return (
    <section className={`widget tone-${tone} ${className}`} {...rest}>
      {(title || action) && (
        <header className="widget-head">
          {title && (
            <h3>
              {Icon && <Icon size={18} strokeWidth={2.2} aria-hidden="true" />}
              {title}
            </h3>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Segmented({ options, value, onChange, label, size }) {
  return (
    <div className={`segmented ${size ? `segmented-${size}` : ""}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(o.value)}
          title={o.hint}
        >
          {o.icon && <o.icon size={15} strokeWidth={2.2} aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressRing({ value, size = 96, stroke = 10, color = "#292C47", track = "rgba(41,44,71,.12)", children, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-arc"
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export function Bars({ data, color = "#292C47", height = 56, label }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" style={{ height }} role="img" aria-label={label}>
      {data.map((d, i) => (
        <div key={i} className="bar-col" title={`${d.label}: ${d.value}`}>
          <div className="bar" style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: d.value ? color : "rgba(48,44,53,.12)" }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ series, height = 120, max = 100, label }) {
  const w = 320;
  const h = height;
  const pad = 10;
  const n = Math.max(...series.map((s) => s.points.length), 2);
  const x = (i) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v) => h - pad - (Math.max(0, Math.min(max, v)) / max) * (h - pad * 2);
  return (
    <svg className="linechart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={y(max * t)} y2={y(max * t)} stroke="rgba(48,44,53,.10)" strokeDasharray="3 4" />
      ))}
      {series.map((s) =>
        s.points.length ? (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={s.points.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {s.points.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        ) : null
      )}
    </svg>
  );
}

export function EmptyState({ illustration, title, children, action }) {
  return (
    <div className="empty">
      {illustration}
      <h4>{title}</h4>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

// Searchable language picker; native names first.
export function LanguagePicker({ value, onChange, label = "Home language", compact }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const id = useId();
  const current = findLang(value);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? LANGUAGES.filter((l) => l.name.toLowerCase().includes(t) || l.native.toLowerCase().includes(t)) : LANGUAGES;
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={`langpick ${compact ? "compact" : ""}`} ref={ref}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <button id={id} type="button" className="langpick-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span lang={current.code} dir={current.rtl ? "rtl" : "ltr"}>
          {current.native}
        </span>
        {current.native !== current.name && <span className="muted">{current.name}</span>}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="langpick-pop">
          <div className="langpick-search">
            <Search size={16} aria-hidden="true" />
            <input autoFocus placeholder="Search languages" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search languages" />
          </div>
          <ul role="listbox" aria-label="Languages">
            {list.map((l) => (
              <li key={l.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.name === value}
                  onClick={() => {
                    onChange(l.name);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <span lang={l.code} dir={l.rtl ? "rtl" : "ltr"}>
                    {l.native}
                  </span>
                  {l.native !== l.name && <span className="muted">{l.name}</span>}
                  {l.name === value && <Check size={16} aria-hidden="true" />}
                </button>
              </li>
            ))}
            {!list.length && <li className="muted langpick-none">No match. Try the English name.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// Ascending bars: each step is a level of language support.
export function LevelSteps({ value, onChange, busyLevel }) {
  return (
    <div className="levelsteps" role="radiogroup" aria-label="Reading level">
      {LEVELS.map((l, i) => (
        <button
          key={String(l.id)}
          type="button"
          role="radio"
          aria-checked={String(value) === String(l.id)}
          className={`step ${String(value) === String(l.id) ? "on" : ""} ${String(busyLevel) === String(l.id) ? "busy" : ""}`}
          onClick={() => onChange(l.id)}
        >
          <span className="step-bar" style={{ height: `${28 + i * 14}px` }} />
          <span className="step-label">{l.label}</span>
          <span className="step-sub">{l.support}</span>
        </button>
      ))}
    </div>
  );
}
