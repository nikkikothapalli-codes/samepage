import { useEffect, useState } from "react";
import { BookMarked, ChartLine, Home, Languages, Library, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useRoute } from "./router.js";
import { updateSettings, useStore } from "./store.js";
import { LanguagePicker } from "./ui.jsx";
import Logo from "./Logo.jsx";
import Landing from "./Landing.jsx";
import Dashboard from "./Dashboard.jsx";
import Adapt from "./Adapt.jsx";
import Workspace from "./Workspace.jsx";
import LibraryPage from "./Library.jsx";
import Vocabulary from "./Vocabulary.jsx";
import Progress from "./Progress.jsx";
import Settings from "./Settings.jsx";

const NAV = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/adapt", label: "Adapt a Page", icon: Sparkles },
  { path: "/library", label: "My Library", icon: Library },
  { path: "/vocabulary", label: "Vocabulary", icon: BookMarked },
  { path: "/progress", label: "My Progress", icon: ChartLine },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

const CRUMBS = { "/home": "Home", "/adapt": "Adapt a Page", "/library": "My Library", "/vocabulary": "Vocabulary", "/progress": "My Progress", "/settings": "Settings" };

export default function App() {
  const route = useRoute();
  const { settings } = useStore();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1100);

  // Accessibility settings apply app-wide.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--read-size", `${settings.fontSize}px`);
    root.style.setProperty("--read-lh", settings.lineHeight);
    root.classList.toggle("high-contrast", settings.contrast);
    root.classList.toggle("reduce-motion", settings.reduceMotion);
  }, [settings]);

  if (route === "/" || route === "") return <Landing />;

  const readMatch = route.match(/^\/read\/(.+)$/);
  const base = readMatch ? "/library" : route;

  let page;
  if (readMatch) page = <Workspace id={readMatch[1]} />;
  else if (route === "/home") page = <Dashboard />;
  else if (route === "/adapt") page = <Adapt />;
  else if (route === "/library") page = <LibraryPage />;
  else if (route === "/vocabulary") page = <Vocabulary />;
  else if (route === "/progress") page = <Progress />;
  else if (route === "/settings") page = <Settings />;
  else page = <Dashboard />;

  return (
    <div className={`shell ${collapsed ? "collapsed" : ""}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo />
          <button className="icon-btn collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <a key={n.path} href={`#${n.path}`} className={`nav-item ${base === n.path ? "active" : ""}`} aria-current={base === n.path ? "page" : undefined} title={n.label}>
              <n.icon size={20} strokeWidth={2} aria-hidden="true" />
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>Supports UN Sustainable Development Goals 4 and 10. Not affiliated with the United Nations.</p>
        </div>
      </aside>

      <div className="main-col">
        {!readMatch && (
          <header className="topbar">
            <nav className="crumbs" aria-label="Breadcrumb">
              <a href="#/home">SamePage</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{CRUMBS[route] || "Home"}</span>
            </nav>
            <div className="topbar-right">
              <Languages size={18} aria-hidden="true" className="muted-icon" />
              <LanguagePicker compact label="" value={settings.language} onChange={(language) => updateSettings({ language })} />
              <span className="avatar" aria-label="Your profile">
                You
              </span>
            </div>
          </header>
        )}
        <main id="main" className={readMatch ? "main-workspace" : "main-page"}>
          {page}
        </main>
      </div>
    </div>
  );
}
