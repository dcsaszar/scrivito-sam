import { sortBy } from "lodash-es";
import { extractText } from "scrivito";

export function extract(obj, options = {}) {
  const objTitle = obj.get("title");
  const objText = extractText(obj);
  const extractedText = objTitle + objText;

  const unordered = extractAttributesAsArray(obj, {
    ...options,
    extractedText,
  });

  const ordered = sortBy(unordered, (item) => {
    const { value } = item;
    const textValue = value.replace(/(<([^>]+)>)/gi, "");
    const position = extractedText.indexOf(textValue);
    return position === -1
      ? extractedText.length + unordered.indexOf(item)
      : position;
  });

  return ordered
    .flatMap(({ attributeName, contentId, objClass, value }) => [
      `<!-- UUID ${objClass}-${contentId || "xxx"}-${attributeName}: -->`,
      value,
      "",
    ])
    .concat("<!-- UUID EOF -->")
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
            {
              attributeName: name,
              contentId: options.includeIds ? content.id() : undefined,
              objClass: content.objClass(),
              value:
                type === "link" ? content.get(name).title() : content.get(name),
            },
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
