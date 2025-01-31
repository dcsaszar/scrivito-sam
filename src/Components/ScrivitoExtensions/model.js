export function getModel() {
  const fallback = DEFAULT_MODEL;
  try {
    const model = localStorage.getItem("scrivito_ai_model");
    return model && availableModels.includes(model) ? model : fallback;
  } catch {
    return fallback;
  }
}

export function setModel(model) {
  localStorage.setItem("scrivito_ai_model", model);
}

const DEFAULT_MODEL = "aws/anthropic.claude-3-5-sonnet-20240620-v1:0";

export const availableModels = [
  DEFAULT_MODEL,
  "gpt-4o-mini",
  "chatgpt-4o-latest",
];
