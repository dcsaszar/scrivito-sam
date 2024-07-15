export function getPrimaryAttributeName(content) {
  const entries = content.nestedContent
    ? Object.entries(content.widget.attributeDefinitions())
    : Object.entries(content.attributeDefinitions());

  return ["html", "string", "link"]
    .flatMap((type) =>
      entries.map(([attributeName, [attributeType]]) =>
        attributeType === type ? attributeName : null
      )
    )
    .find((n) => !!n);
}
