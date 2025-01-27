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

  return parts;
}

const SPLIT =
  /<\/html>\s*```|```html\n<html[^<>]*>?|<\/html>|<html[^<>]*>?|```[a-z]*/;
