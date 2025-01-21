import { extractText } from "scrivito";

export function extract(obj, options = {}) {
  const objTitle = obj.get("title");
  const objText = extractText(obj);
  return extractAttributesAsArray(obj, {
    ...options,
    extractedText: objTitle + objText,
  })
    .concat("\n<!-- UUID EOF -->")
    .join("\n");
}

function extractAttributesAsArray(content, options) {
  const attributeDefinitions = Object.entries(content.attributeDefinitions());
  const textDefinitions = attributeDefinitions.filter(
    ([name, [type]]) =>
      type === "html" ||
      (type === "string" &&
        content.get(name).length > 2 &&
        options.extractedText.includes(content.get(name))) ||
      (type === "link" && content.get(name)?.title())
  );
  const widgetlistDefinitions = attributeDefinitions.filter(
    ([, [type]]) => type === "widgetlist"
  );
  return [...textDefinitions, ...widgetlistDefinitions].flatMap(
    ([name, [type]]) =>
      type === "widgetlist"
        ? content
            .get(name)
            .flatMap((widget) => extractAttributesAsArray(widget, options))
        : [
            `\n<!-- UUID ${content.objClass()}-${
              options.includeIds ? content.id() : "xxx"
            }-${name}: -->`,
            type === "link" ? content.get(name).title() : content.get(name),
          ]
  );
}

export function getWidgetsAsArray(content) {
  return Object.entries(content.attributeDefinitions())
    .filter(([, [type]]) => type === "widgetlist")
    .flatMap(([name]) =>
      content
        .get(name)
        .flatMap((widget) => [widget, ...getWidgetsAsArray(widget)])
    );
}
