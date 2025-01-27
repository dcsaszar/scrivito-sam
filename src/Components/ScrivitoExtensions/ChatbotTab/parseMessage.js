export function parseMessage(message) {
  let preprocessedContent = message;
  if (message.includes("<widget") && !message.includes("<html")) {
    preprocessedContent = preprocessedContent.replace(
      "<widget",
      "<html><widget"
    );
    const tmpForReplace = [...preprocessedContent.split("</widget>")];
    tmpForReplace[tmpForReplace.length - 1] = `</html>${tmpForReplace.at(-1)}`;
    preprocessedContent = tmpForReplace.join("</widget>");
  }

  const parts = preprocessedContent.split(SPLIT);

  return parts
    .map((value) => value.trim())
    .filter((value) => !!value)
    .map((value) => {
      const isHtml = value.includes("<widget ");
      return { type: isHtml ? "html" : "text", value };
    });
}

const SPLIT =
  /<\/html>\s*```|```html\n<html[^<>]*>?|<\/html>|<html[^<>]*>?|```[a-z]*/;
