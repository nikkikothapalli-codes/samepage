// Demo content: a real photosynthesis passage adapted by hand, so visitors can explore the
// workspace before they have an API key or a textbook nearby. Readability and retention
// numbers for it are still calculated live, not stored.
import { SAMPLE_TEXT } from "./constants.js";

const S = [
  "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy.",
  "Within the chloroplasts of leaf cells, the pigment chlorophyll absorbs sunlight.",
  "This energy is used to combine carbon dioxide, taken in through small pores called stomata, with water absorbed by the roots.",
  "The reaction produces glucose, a sugar that the plant uses for energy and growth, and releases oxygen into the atmosphere as a byproduct.",
  "Consequently, photosynthesis sustains nearly all life on Earth by supplying both the oxygen organisms breathe and the energy at the base of most food chains.",
];

export const DEMO_RESULT = {
  title: "How plants make food",
  subject: "Science",
  originalText: SAMPLE_TEXT,
  segments: [
    {
      source: S[0],
      adapted: "Photosynthesis is how green plants, algae, and some bacteria make food. They turn light energy into chemical energy.",
      translation: "La fotosíntesis es la forma en que las plantas verdes, las algas y algunas bacterias producen alimento. Convierten la energía de la luz en energía química.",
      newParagraph: true,
    },
    {
      source: S[1],
      adapted: "Leaves have tiny parts called chloroplasts. Inside them, a green material called chlorophyll catches sunlight.",
      translation: "Las hojas tienen partes muy pequeñas llamadas cloroplastos. Dentro de ellos, un material verde llamado clorofila atrapa la luz del sol.",
      newParagraph: false,
    },
    {
      source: S[2],
      adapted: "The plant uses this energy to join carbon dioxide and water. Carbon dioxide comes in through tiny holes called stomata. Water comes in through the roots.",
      translation: "La planta usa esta energía para unir el dióxido de carbono y el agua. El dióxido de carbono entra por unos agujeros diminutos llamados estomas. El agua entra por las raíces.",
      newParagraph: true,
    },
    {
      source: S[3],
      adapted: "This makes glucose. Glucose is a sugar that gives the plant energy to grow. The plant also lets out oxygen into the air.",
      translation: "Así se forma la glucosa. La glucosa es un azúcar que le da a la planta energía para crecer. La planta también suelta oxígeno al aire.",
      newParagraph: false,
    },
    {
      source: S[4],
      adapted: "Because of this, almost all life on Earth needs photosynthesis. It gives living things oxygen to breathe and energy for food chains.",
      translation: "Por eso, casi toda la vida en la Tierra necesita la fotosíntesis. Les da a los seres vivos oxígeno para respirar y energía para las cadenas alimentarias.",
      newParagraph: true,
    },
  ].map((s, i) => ({ ...s, id: i })),
  vocab: [
    { word: "Photosynthesis", definition: "How plants use sunlight to make their own food.", translation: "fotosíntesis", definitionTranslated: "Cómo las plantas usan la luz del sol para hacer su propio alimento.", example: "Photosynthesis happens in the leaves." },
    { word: "chloroplasts", definition: "Tiny parts inside leaf cells where plants make food.", translation: "cloroplastos", definitionTranslated: "Partes diminutas dentro de las células de las hojas donde las plantas hacen alimento.", example: "Chloroplasts are green because of chlorophyll." },
    { word: "chlorophyll", definition: "The green material in leaves that catches sunlight.", translation: "clorofila", definitionTranslated: "El material verde de las hojas que atrapa la luz del sol.", example: "Chlorophyll makes leaves look green." },
    { word: "carbon dioxide", definition: "A gas in the air that plants take in.", translation: "dióxido de carbono", definitionTranslated: "Un gas del aire que las plantas absorben.", example: "We breathe out carbon dioxide." },
    { word: "stomata", definition: "Tiny holes on a leaf that let gases in and out.", translation: "estomas", definitionTranslated: "Agujeros diminutos en la hoja que dejan entrar y salir gases.", example: "Stomata open during the day." },
    { word: "glucose", definition: "A kind of sugar that stores energy.", translation: "glucosa", definitionTranslated: "Un tipo de azúcar que guarda energía.", example: "The plant uses glucose to grow." },
    { word: "oxygen", definition: "A gas in the air that people and animals need to breathe.", translation: "oxígeno", definitionTranslated: "Un gas del aire que las personas y los animales necesitan para respirar.", example: "Trees give off oxygen." },
  ],
  concepts: [
    { name: "Light becomes chemical energy", sourceEvidence: S[0], adaptedEvidence: "They turn light energy into chemical energy." },
    { name: "Chlorophyll", sourceEvidence: S[1], adaptedEvidence: "Inside them, a green material called chlorophyll catches sunlight." },
    { name: "Carbon dioxide + water", sourceEvidence: S[2], adaptedEvidence: "The plant uses this energy to join carbon dioxide and water." },
    { name: "Glucose", sourceEvidence: S[3], adaptedEvidence: "Glucose is a sugar that gives the plant energy to grow." },
    { name: "Oxygen", sourceEvidence: S[3], adaptedEvidence: "The plant also lets out oxygen into the air." },
    { name: "Life on Earth", sourceEvidence: S[4], adaptedEvidence: "It gives living things oxygen to breathe and energy for food chains." },
  ],
  links: [
    { from: "Chlorophyll", to: "Light becomes chemical energy", label: "captures light" },
    { from: "Light becomes chemical energy", to: "Glucose", label: "powers" },
    { from: "Carbon dioxide + water", to: "Glucose", label: "combine into" },
    { from: "Carbon dioxide + water", to: "Oxygen", label: "releases" },
    { from: "Glucose", to: "Life on Earth", label: "feeds" },
    { from: "Oxygen", to: "Life on Earth", label: "lets us breathe" },
  ],
};

// Landing-page preview: the first two sentences at every level, in three languages.
export const PREVIEW = {
  original: {
    en: `${S[0]} ${S[1]}`,
    es: "La fotosíntesis es el proceso mediante el cual las plantas verdes, las algas y algunas bacterias convierten la energía luminosa en energía química. Dentro de los cloroplastos de las células de las hojas, el pigmento clorofila absorbe la luz solar.",
    pt: "A fotossíntese é o processo pelo qual plantas verdes, algas e algumas bactérias convertem energia luminosa em energia química. Dentro dos cloroplastos das células das folhas, o pigmento clorofila absorve a luz solar.",
  },
  8: {
    en: "Photosynthesis is how green plants, algae, and some bacteria change light energy into chemical energy. Inside leaf cells are chloroplasts. They hold a green pigment called chlorophyll, which absorbs sunlight.",
    es: "La fotosíntesis es la forma en que las plantas verdes, las algas y algunas bacterias cambian la energía luminosa en energía química. Dentro de las células de las hojas hay cloroplastos. Contienen un pigmento verde llamado clorofila, que absorbe la luz del sol.",
    pt: "A fotossíntese é a forma como plantas verdes, algas e algumas bactérias transformam energia luminosa em energia química. Dentro das células das folhas há cloroplastos. Eles guardam um pigmento verde chamado clorofila, que absorve a luz do sol.",
  },
  4: {
    en: "Photosynthesis is how plants make their own food. Green plants, algae, and some bacteria can do it. They turn light energy into a kind of energy they can use. Leaves have tiny parts called chloroplasts. Inside them is a green material called chlorophyll. It catches sunlight.",
    es: "La fotosíntesis es la forma en que las plantas hacen su propio alimento. Las plantas verdes, las algas y algunas bacterias pueden hacerlo. Convierten la energía de la luz en un tipo de energía que pueden usar. Las hojas tienen partes muy pequeñas llamadas cloroplastos. Dentro de ellas hay un material verde llamado clorofila. Atrapa la luz del sol.",
    pt: "A fotossíntese é a forma como as plantas fazem seu próprio alimento. Plantas verdes, algas e algumas bactérias conseguem fazer isso. Elas transformam energia luminosa em um tipo de energia que podem usar. As folhas têm partes bem pequenas chamadas cloroplastos. Dentro delas há um material verde chamado clorofila. Ele captura a luz do sol.",
  },
  2: {
    en: "Plants make their own food, and they use light from the sun to do it. Leaves have a green part called chlorophyll that catches the sunlight.",
    es: "Las plantas hacen su propia comida, y usan la luz del sol para hacerlo. Las hojas tienen una parte verde llamada clorofila que atrapa la luz del sol.",
    pt: "As plantas fazem sua própria comida, e usam a luz do sol para isso. As folhas têm uma parte verde chamada clorofila que captura a luz do sol.",
  },
};
export const PREVIEW_WORDS = { es: { chlorophyll: "clorofila", chloroplasts: "cloroplastos", photosynthesis: "fotosíntesis" }, pt: { chlorophyll: "clorofila", chloroplasts: "cloroplastos", photosynthesis: "fotossíntese" } };
