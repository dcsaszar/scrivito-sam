export function updateObj(contents, parts) {
  contents.forEach((content) => {
    const updates = {};
    parts.forEach(({ id, value, attributeName }) => {
      if (content.id() !== id) return;
      const attributeValue =
        content.attributeDefinitions()[attributeName][0] === "link"
          ? content.get(attributeName).copy({ title: value })
          : value;
      updates[attributeName] = attributeValue;
    });

    if (Object.keys(updates).length) content.update(updates);
  });
}
