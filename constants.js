// Languages show their native name first so students can find their own.
export const LANGUAGES = [
  { name: "Spanish", native: "Español", code: "es" },
  { name: "Arabic", native: "العربية", code: "ar", rtl: true },
  { name: "Vietnamese", native: "Tiếng Việt", code: "vi" },
  { name: "Simplified Chinese", native: "简体中文", code: "zh-CN" },
  { name: "Swahili", native: "Kiswahili", code: "sw" },
  { name: "Portuguese", native: "Português", code: "pt-BR" },
  { name: "Haitian Creole", native: "Kreyòl ayisyen", code: "ht" },
  { name: "French", native: "Français", code: "fr" },
  { name: "Hindi", native: "हिन्दी", code: "hi" },
  { name: "Bengali", native: "বাংলা", code: "bn" },
  { name: "Urdu", native: "اردو", code: "ur", rtl: true },
  { name: "Dari", native: "دری", code: "fa", rtl: true },
  { name: "Pashto", native: "پښتو", code: "ps", rtl: true },
  { name: "Ukrainian", native: "Українська", code: "uk" },
  { name: "Russian", native: "Русский", code: "ru" },
  { name: "Korean", native: "한국어", code: "ko" },
  { name: "Tagalog", native: "Tagalog", code: "fil" },
  { name: "Indonesian", native: "Bahasa Indonesia", code: "id" },
  { name: "Nepali", native: "नेपाली", code: "ne" },
  { name: "Somali", native: "Soomaali", code: "so" },
  { name: "Amharic", native: "አማርኛ", code: "am" },
  { name: "Hausa", native: "Hausa", code: "ha" },
  { name: "Yoruba", native: "Yorùbá", code: "yo" },
  { name: "Igbo", native: "Igbo", code: "ig" },
  { name: "Zulu", native: "isiZulu", code: "zu" },
  { name: "Kinyarwanda", native: "Kinyarwanda", code: "rw" },
];
export const findLang = (name) => LANGUAGES.find((l) => l.name === name) || LANGUAGES[0];

// Levels describe how much language support a reader gets, not how smart they are.
export const LEVELS = [
  { id: 2, label: "Grades 2–3", support: "Most support" },
  { id: 4, label: "Grades 4–5", support: "Lots of support" },
  { id: 6, label: "Grades 6–7", support: "Some support" },
  { id: 8, label: "Grades 8–9", support: "A little support" },
  { id: "original", label: "Original", support: "No changes" },
];
export const findLevel = (id) => LEVELS.find((l) => String(l.id) === String(id)) || LEVELS[1];

// Each subject gets its own solid color block (with a dark ink that passes contrast on it).
export const SUBJECTS = {
  Science: { color: "#08B99A", ink: "#062F28", tint: "#DDF6F0" },
  Biology: { color: "#08B99A", ink: "#062F28", tint: "#DDF6F0" },
  Health: { color: "#08B99A", ink: "#062F28", tint: "#DDF6F0" },
  History: { color: "#FF8900", ink: "#3D2000", tint: "#FFEBD3" },
  Geography: { color: "#2959F3", ink: "#FFFFFF", tint: "#E1E8FE" },
  Civics: { color: "#9D8BF5", ink: "#1E1747", tint: "#ECE9FE" },
  Math: { color: "#FFC524", ink: "#3B2D00", tint: "#FFF4CF" },
  Literature: { color: "#FF554D", ink: "#FFFFFF", tint: "#FFE3E1" },
};
export const subjectStyle = (s) => SUBJECTS[s] || { color: "#9D8BF5", ink: "#1E1747", tint: "#ECE9FE" };

export const SAMPLE_TEXT = `Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy. Within the chloroplasts of leaf cells, the pigment chlorophyll absorbs sunlight. This energy is used to combine carbon dioxide, taken in through small pores called stomata, with water absorbed by the roots. The reaction produces glucose, a sugar that the plant uses for energy and growth, and releases oxygen into the atmosphere as a byproduct. Consequently, photosynthesis sustains nearly all life on Earth by supplying both the oxygen organisms breathe and the energy at the base of most food chains.`;
