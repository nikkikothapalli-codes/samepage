import { clearAll, updateSettings, useStore } from "./store.js";
import { LanguagePicker, LevelSteps, Segmented, Widget } from "./ui.jsx";

export default function Settings() {
  const { settings } = useStore();
  return (
    <div className="page settings-page">
      <header className="page-head">
        <h1>Settings</h1>
        <p>Make reading comfortable. Changes save automatically.</p>
      </header>
      <div className="settings-grid">
        <Widget tone="white" title="Reading comfort">
          <div className="set-row">
            <span>Text size</span>
            <input type="range" min="15" max="28" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })} aria-label="Text size" />
            <b>{settings.fontSize}px</b>
          </div>
          <div className="set-row">
            <span>Line spacing</span>
            <Segmented label="Line spacing" size="sm" value={settings.lineHeight} onChange={(lineHeight) => updateSettings({ lineHeight })} options={[{ value: 1.6, label: "Snug" }, { value: 1.8, label: "Comfy" }, { value: 2.1, label: "Airy" }]} />
          </div>
          <label className="set-row check">
            <span>High-contrast reading</span>
            <input type="checkbox" checked={settings.contrast} onChange={(e) => updateSettings({ contrast: e.target.checked })} />
          </label>
          <label className="set-row check">
            <span>Reduce motion</span>
            <input type="checkbox" checked={settings.reduceMotion} onChange={(e) => updateSettings({ reduceMotion: e.target.checked })} />
          </label>
          <p className="reading sample" style={{ fontSize: "var(--read-size)", lineHeight: "var(--read-lh)" }}>
            Plants use sunlight to make their own food. This is called photosynthesis.
          </p>
        </Widget>
        <Widget tone="lilac" title="Defaults for new pages">
          <LanguagePicker value={settings.language} onChange={(language) => updateSettings({ language })} label="Home language" />
          <span className="field-label">Language support</span>
          <LevelSteps value={settings.level} onChange={(level) => updateSettings({ level })} />
        </Widget>
        <Widget tone="peach" title="Your data">
          <p>Your pages, words and scores are saved only in this browser. Nothing is sent anywhere except the page you choose to adapt.</p>
          <button className="btn btn-ghost" onClick={() => confirm("Delete all your pages, words and scores from this browser?") && clearAll()}>
            Delete everything
          </button>
        </Widget>
      </div>
    </div>
  );
}
