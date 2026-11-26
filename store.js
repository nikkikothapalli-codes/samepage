// Everything a student saves lives in their own browser (localStorage). Nothing is invented:
// every number on the dashboard comes from what's stored here.
import { useEffect, useState } from "react";

const KEY = "samepage:v1";
const empty = { passages: [], vocab: [], settings: { fontSize: 19, lineHeight: 1.8, contrast: false, reduceMotion: false, language: "Spanish", level: 4 } };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(empty);
    const data = JSON.parse(raw);
    return { ...structuredClone(empty), ...data, settings: { ...empty.settings, ...(data.settings || {}) } };
  } catch {
    return structuredClone(empty);
  }
}

let state = read();
const listeners = new Set();

function write(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory.
  }
  listeners.forEach((l) => l(state));
}

export function useStore() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    return () => listeners.delete(setS);
  }, []);
  return s;
}

export const getState = () => state;

export function updateSettings(patch) {
  write({ ...state, settings: { ...state.settings, ...patch } });
}

export function savePassage(p) {
  const others = state.passages.filter((x) => x.id !== p.id);
  write({ ...state, passages: [{ ...p, lastOpened: Date.now() }, ...others] });
}

export function updatePassage(id, patch) {
  write({ ...state, passages: state.passages.map((p) => (p.id === id ? { ...p, ...patch, lastOpened: Date.now() } : p)) });
}

export function deletePassage(id) {
  write({ ...state, passages: state.passages.filter((p) => p.id !== id) });
}

export function isWordSaved(word) {
  return state.vocab.some((v) => v.word.toLowerCase() === word.toLowerCase());
}

export function toggleWord(entry, meta) {
  if (isWordSaved(entry.word)) {
    write({ ...state, vocab: state.vocab.filter((v) => v.word.toLowerCase() !== entry.word.toLowerCase()) });
  } else {
    write({ ...state, vocab: [{ ...entry, ...meta, savedAt: Date.now(), mastery: "new" }, ...state.vocab] });
  }
}

export function setMastery(word, mastery) {
  write({ ...state, vocab: state.vocab.map((v) => (v.word === word ? { ...v, mastery, reviewedAt: Date.now() } : v)) });
}

export function clearAll() {
  write(structuredClone(empty));
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
