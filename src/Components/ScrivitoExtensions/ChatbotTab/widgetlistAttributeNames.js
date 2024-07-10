import { sortBy } from "lodash-es";

export function widgetlistAttributeNames(content) {
  const attributes = content.attributeDefinitions();
  console.log("attributes", attributes);
  const attributeNames = Object.keys(attributes);
  console.log("attributeNames", attributeNames);

  if (
    attributeNames.some(
      (name) => name === "text" && attributes[name][0] === "html"
    )
  ) {
    return [];
  }

  return sortBy(
    attributeNames.filter((name) => attributes[name][0] === "widgetlist"),
    (name) => name.replace("nav", "0")
  );
}
