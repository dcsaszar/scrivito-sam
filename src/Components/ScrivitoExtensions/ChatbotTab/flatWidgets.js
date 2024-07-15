import { widgetlistAttributeNames } from "./widgetlistAttributeNames.js";

export function flatWidgets(content) {
  return widgetlistAttributeNames(content).flatMap((attributeName) => {
    const widgets = content.get(attributeName);
    return widgets.map((widget) => {
      const nestedWidgetLists = widgetlistAttributeNames(widget);
      if (nestedWidgetLists.length) {
        console.log(widget);
        return {
          ...widget,
          nestedContent: flatWidgets(widget) // Include nested content while preserving the current widget
        };
      } else {
        return widget;
      }
    });
  });
}