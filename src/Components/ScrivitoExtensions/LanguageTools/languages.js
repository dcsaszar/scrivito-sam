export const languages = {
  de: {
    analyzeHeading: "Textanalyse",
    approxChanges: "<PERCENT> % ‒ <COUNT> Stellen überarbeitet",
    configurePrompt: "Richtlinien konfigurieren",
    formalTone: "Eher sachlich",
    friendlyTone: "Freundlicher",
    informalTone: "Eher informell",
    recommendations: "Empfehlungen",
    simpleLanguage: "Einfache Sprache",
    toneHeading: "Schreibstil verbessern",
    toneOfVoice: "Unseren Richtlinien folgend",
    translate: "Übersetzen",
    translationHeading: "Übersetzen (Zielsprache: <LOCALIZEDPAGELANGUAGE>)",
  },
  en: {
    analyzeHeading: "Text analysis",
    approxChanges: "<PERCENT>% ‒ <COUNT> passages revised",
    configurePrompt: "Configure guidelines",
    formalTone: "More formal",
    friendlyTone: "More friendly",
    informalTone: "Less formal",
    recommendations: "Recommendations",
    simpleLanguage: "Simple language",
    toneHeading: "Improve writing style",
    toneOfVoice: "Follow our guidelines",
    translate: "Translate",
    translationHeading: "Translate (to: <LOCALIZEDPAGELANGUAGE>)",
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
