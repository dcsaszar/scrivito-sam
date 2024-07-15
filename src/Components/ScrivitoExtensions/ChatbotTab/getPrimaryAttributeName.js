export function getPrimaryAttributeName(content) {
  console.log(content);
  let entries = {};
  if (content.nestedContent){
    entries = Object.entries(content.widget.attributeDefinitions());
  }else{
    entries = Object.entries(content.attributeDefinitions());
  }
  console.log(entries);
  return ["html", "string", "link"]
    .flatMap((type) =>
      entries.map(([attributeName, [attributeType]]) =>
        attributeType === type ? attributeName : null
      )
    )
    .find((n) => !!n);
}
