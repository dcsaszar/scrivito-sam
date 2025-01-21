export function getModel() {
  const fallback = "gpt-4o-mini";
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

export const availableModels = [
  "gpt-4o-mini",
  "chatgpt-4o-latest",
  "aws/anthropic.claude-3-5-sonnet-20240620-v1:0",
];
