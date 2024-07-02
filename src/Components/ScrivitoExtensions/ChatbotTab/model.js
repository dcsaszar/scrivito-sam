export function getModel() {
  const fallback = "codestral-latest";
  try {
    return localStorage.getItem("openai_model") || fallback;
  } catch {
    return fallback;
  }
}
