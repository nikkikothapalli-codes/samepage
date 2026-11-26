import { useEffect, useRef, useState } from "react";
import { Camera, Check, ClipboardPaste, ImageUp, Loader2, PlayCircle, Sparkles, X } from "lucide-react";
import { adaptPage } from "./api.js";
import { resizeImage } from "./image.js";
import { SAMPLE_TEXT } from "./constants.js";
import { savePassage, updateSettings, useStore } from "./store.js";
import { makePassage, openDemo } from "./passages.js";
import { verifyConcepts } from "./verify.js";
import { adaptedText } from "./api.js";
import { TransformArt } from "./Illustrations.jsx";
import { Button, LanguagePicker, LevelSteps, Segmented } from "./ui.jsx";

// Each stage is only ticked once the work behind it has actually finished.
const STAGES = ["Reading your page", "Identifying key concepts", "Adapting the language", "Checking knowledge retention", "Preparing your learning experience"];

export default function Adapt() {
  const { settings } = useStore();
  const [mode, setMode] = useState(() => {
    try {
      const m = sessionStorage.getItem("samepage:mode");
      sessionStorage.removeItem("samepage:mode");
      return m === "photo" ? "upload" : m === "paste" ? "paste" : "upload";
    } catch {
      return "upload";
    }
  });
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [level, setLevel] = useState(settings.level ?? 4);
  const [language, setLanguage] = useState(settings.language);
  const [error, setError] = useState("");
  const [done, setDone] = useState(-1); // index of last finished stage
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const fileRef = useRef(null);
  const camRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function pick(file) {
    if (!file || !file.type.startsWith("image/")) return setError("That file isn't an image. Try a JPG or PNG photo.");
    setError("");
    try {
      setImage(await resizeImage(file));
    } catch {
      setError("Couldn't read that photo. Try another one.");
    }
  }

  async function run() {
    setError("");
    const usingText = mode === "paste";
    if (usingText && text.trim().length < 40) return setError("Add at least a few sentences first.");
    if (!usingText && !image) return setError("Add a photo of the page first.");

    updateSettings({ language, level });
    setBusy(true);
    setDone(-1);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 90000);
    try {
      // Stage 1: the page is ready to send (text read / photo resized).
      setDone(0);
      const result = await adaptPage({
        text: usingText ? text.trim() : "",
        image: usingText ? null : { data: image.data, mimeType: image.mimeType },
        level,
        language,
        signal: ctrl.signal,
      });
      // Stages 2–3: concepts and adapted language both arrive in the AI response.
      setDone(2);
      // Stage 4: verify concepts against both texts in the browser.
      const verified = verifyConcepts(result.concepts, result.originalText, adaptedText(result.segments));
      setDone(3);
      // Stage 5: save the passage and open it.
      let thumb = null;
      if (image) {
        try {
          thumb = (await resizeImage(dataUrlToFile(image.dataUrl), 480)).dataUrl;
        } catch {}
      }
      const passage = makePassage({ ...result, verified }, { level, language, thumb, source: usingText ? "paste" : "photo" });
      savePassage(passage);
      setDone(4);
      setTimeout(() => (window.location.hash = `/read/${passage.id}`), 450);
    } catch (e) {
      setBusy(false);
      setError(e.name === "AbortError" ? "That took too long. Try a shorter page or try again." : e.message);
    } finally {
      clearTimeout(timer);
    }
  }

  if (busy) {
    const active = done + 1;
    return (
      <div className="page adapt-processing">
        <div className="processing-card">
          <TransformArt stage={Math.min(active, 4)} />
          <h1>Making this page yours…</h1>
          <ol className="stages">
            {STAGES.map((s, i) => (
              <li key={s} className={i <= done ? "done" : i === active ? "active" : ""}>
                <span className="stage-dot">{i <= done ? <Check size={14} /> : i === active ? <Loader2 size={14} className="spin" /> : null}</span>
                {s}
              </li>
            ))}
          </ol>
          <Button
            variant="ghost"
            icon={X}
            onClick={() => {
              abortRef.current?.abort();
              setBusy(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page adapt">
      <header className="page-head">
        <h1>Make this page yours<span className="dot">.</span></h1>
        <p>Snap or paste a page, choose your support, and SamePage does the rest.</p>
      </header>

      <div className="adapt-grid">
        <section className="widget tone-white adapt-input">
          <Segmented
            label="How to add your page"
            value={mode}
            onChange={setMode}
            options={[
              { value: "upload", label: "Photo or image", icon: ImageUp },
              { value: "paste", label: "Paste text", icon: ClipboardPaste },
            ]}
          />

          {mode === "upload" ? (
            image ? (
              <div className="photo-preview">
                <img src={image.dataUrl} alt="Your textbook page" />
                <button className="icon-btn" onClick={() => setImage(null)} aria-label="Remove photo">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                className="drop"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pick(e.dataTransfer.files[0]);
                }}
              >
                <ImageUp size={36} aria-hidden="true" />
                <p>
                  <b>Drop a photo of your page here</b>
                  <br />
                  JPG or PNG, one page at a time
                </p>
                <div className="row">
                  <Button variant="secondary" icon={ImageUp} onClick={() => fileRef.current?.click()}>
                    Upload image
                  </Button>
                  <Button variant="secondary" icon={Camera} onClick={() => camRef.current?.click()}>
                    Take a photo
                  </Button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
                <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files[0])} />
              </div>
            )
          ) : (
            <div className="paste">
              <label className="field-label" htmlFor="passage">
                Your passage
              </label>
              <textarea id="passage" value={text} onChange={(e) => setText(e.target.value)} maxLength={8000} placeholder="Paste a paragraph or two from your textbook" />
              <div className="row-between">
                <button className="text-btn" onClick={() => setText(SAMPLE_TEXT)}>
                  Use a sample science passage
                </button>
                <span className="muted small">{text.length} / 8000</span>
              </div>
            </div>
          )}
        </section>

        <section className="widget tone-lilac adapt-settings">
          <LanguagePicker value={language} onChange={setLanguage} label="Explain things in" />
          <div>
            <span className="field-label">How much language support?</span>
            <LevelSteps value={level} onChange={setLevel} />
            <p className="hint">Levels change how the English is written, not what you learn. Switch any time while reading.</p>
          </div>
          <Button variant="primary" size="lg" icon={Sparkles} onClick={run}>
            Adapt my page
          </Button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="text-btn center" onClick={openDemo}>
            <PlayCircle size={16} aria-hidden="true" /> Or open the photosynthesis demo
          </button>
        </section>
      </div>
    </div>
  );
}

function dataUrlToFile(dataUrl) {
  const [head, b64] = dataUrl.split(",");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], "page.jpg", { type: head.match(/:(.*?);/)[1] });
}
