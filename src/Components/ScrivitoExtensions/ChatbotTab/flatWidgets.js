import { widgetlistAttributeNames } from "./widgetlistAttributeNames.js";

export function flatWidgets(content) {
  return widgetlistAttributeNames(content).flatMap((attributeName) => {
    const widgets = content.get(attributeName);
    return widgets.map((widget) => {
      const nestedWidgetLists = widgetlistAttributeNames(widget);
      if (nestedWidgetLists.length) {
        return widget && flatWidgets(widget)
      } else {
        return widget;
      }
    });
  });
}