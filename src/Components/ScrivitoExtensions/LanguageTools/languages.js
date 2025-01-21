export const languages = {
  de: {
    analyzeHeading: "Textanalyse",
    approxChanges: "<PERCENT> % ‒ <COUNT> Stellen überarbeitet",
    consistentTone: "Konsistenter Tonfall",
    formalTone: "Eher sachlich",
    informalTone: "Eher informell",
    friendlyTone: "Freundlicher Ton",
    recommendations: "Empfehlungen",
    simpleLanguage: "Einfache Sprache",
    toneHeading: "Sprachstil ändern",
    translate: "Übersetzen",
    translationHeading: "Übersetzen (<LOCALIZEDPAGELANGUAGE>)",
  },
  en: {
    analyzeHeading: "Text analysis",
    approxChanges: "<PERCENT>% ‒ <COUNT> passages revised",
    consistentTone: "Consistent",
    formalTone: "More formal",
    informalTone: "Less formal",
    friendlyTone: "More friendly",
    recommendations: "Recommendations",
    simpleLanguage: "Simple language",
    toneHeading: "Change tone of voice",
    translate: "Translate",
    translationHeading: "Translate (<LOCALIZEDPAGELANGUAGE>)",
  },
};

export function localize(locale, key, args = {}) {
  const localized = (languages[locale] || languages["en"])[key];
  if (!localized) throw new Error(`Missing localization for: ${key}`);
  return replace(localized, args);
}

export function replace(text, args) {
  if (!text) return text;
  return text.replace(/<(\w+)>/g, (_, key) => args[key] || key);
}
