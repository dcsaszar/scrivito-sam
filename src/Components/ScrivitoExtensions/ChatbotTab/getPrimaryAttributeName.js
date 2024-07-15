export function getPrimaryAttributeName(content) {
  console.log(content);
  const entries = Object.entries(content.attributeDefinitions());
  console.log(entries);
  return ["html", "string", "link"]
    .flatMap((type) =>
      entries.map(([attributeName, [attributeType]]) =>
        attributeType === type ? attributeName : null
      )
    )
    .find((n) => !!n);
}
