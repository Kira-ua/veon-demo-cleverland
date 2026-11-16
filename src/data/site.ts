// Facts of Clever Land: only from veon/client.json (client-digest.md). Nothing invented.
export type Gloss = { en: string; es: string; de: string };

export const phone = {
  href: "tel:+380936755444",
  // non-breaking spaces keep the number on one line
  label: "+38\u00a0093\u00a0675\u00a054\u00a044",
};

const map = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const addresses = [
  {
    id: "kulykivska",
    short: "Куликівська, 18а",
    full: "вул. Куликівська, 18а, Львів, 79057",
    street: "вул. Куликівська, 18а",
    postal: "79057",
    map: map("вул. Куликівська, 18а, Львів, 79057"),
  },
  {
    id: "lisna",
    short: "Лісна, 76",
    full: "вул. Лісна, 76, Львів, 79000",
    street: "вул. Лісна, 76",
    postal: "79000",
    map: map("вул. Лісна, 76, Львів, 79000"),
  },
] as const;

export const socials = [
  { name: "Instagram", href: "https://instagram.com/school.clever.land" },
  { name: "Facebook", href: "https://www.facebook.com/cleverland.lviv" },
] as const;

export const futureNote = "Розділ у розробці";

export const h1 = "Школа іноземних мов у Львові для дітей і дорослих";

export const glosses = {
  h1: {
    en: "A foreign language school in Lviv for children and adults",
    es: "Una escuela de idiomas en Lviv para niños y adultos",
    de: "Eine Sprachschule in Lwiw für Kinder und Erwachsene",
  },
  programy: {
    en: "For preschoolers, schoolchildren and adults",
    es: "Para niños en edad preescolar, escolares y adultos",
    de: "Für Vorschulkinder, Schulkinder und Erwachsene",
  },
  umovy: {
    en: "No more than six students in a group",
    es: "No más de seis alumnos por grupo",
    de: "Höchstens sechs Lernende pro Gruppe",
  },
  start: {
    en: "Your first lesson is free",
    es: "La primera clase es gratis",
    de: "Die erste Stunde ist kostenlos",
  },
  sadochok: {
    en: "A half-day mini kindergarten",
    es: "Una pequeña guardería de medio día",
    de: "Ein Mini-Kindergarten für den halben Tag",
  },
  kontakty: {
    en: "Two addresses in Lviv",
    es: "Dos direcciones en Lviv",
    de: "Zwei Adressen in Lwiw",
  },
} satisfies Record<string, Gloss>;

export const programs = [
  {
    id: "doshkilnyata",
    title: "Дошкільнята",
    gloss: { en: "Preschoolers", es: "Preescolares", de: "Vorschulkinder" },
    facts: [
      "Розвиваюча англійська для дошкільнят",
      "У групі не більше шести дітей",
      "Можна індивідуально або в парі",
    ],
    more: "Детальніше про заняття для малюків",
  },
  {
    id: "shkolyari",
    title: "Школярі та НМТ",
    gloss: { en: "Schoolchildren and exam prep", es: "Escolares y preparación de exámenes", de: "Schulkinder und Prüfungsvorbereitung" },
    facts: [
      "Групи за рівнем знань, а не за віком",
      "Інтеграція шкільної програми",
      "Підготовка до НМТ (раніше ЗНО) та вступних іспитів",
    ],
    more: "Детальніше про курси для школярів",
  },
  {
    id: "dorosli",
    title: "Дорослі, IELTS і TOEFL",
    gloss: { en: "Adults, IELTS and TOEFL", es: "Adultos, IELTS y TOEFL", de: "Erwachsene, IELTS und TOEFL" },
    facts: [
      "Індивідуальна програма під вашу мету",
      "Підготовка до співбесіди іноземною мовою",
      "Підготовка до TOEFL та IELTS, також для школярів",
    ],
    more: "Детальніше про курси для дорослих",
  },
] as const;

export const languages = [
  { uk: "англійська", own: "English", lang: "en" },
  { uk: "іспанська", own: "Español", lang: "es" },
  { uk: "німецька", own: "Deutsch", lang: "de" },
] as const;

export const navAnchors = [
  { href: "#programy", label: "Програми" },
  { href: "#umovy", label: "Умови" },
  { href: "#start", label: "Як почати" },
  { href: "#sadochok", label: "Садочок" },
  { href: "#kontakty", label: "Контакти" },
] as const;

export const futurePages = [
  "Дошкільнята",
  "Школярі",
  "Підготовка до НМТ",
  "Дорослі",
  "IELTS і TOEFL",
  "Іспанська",
  "Німецька",
  "Міні-садок",
  "Про школу",
  "Контакти",
] as const;
