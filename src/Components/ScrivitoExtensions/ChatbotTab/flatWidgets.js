import { widgetlistAttributeNames } from "./widgetlistAttributeNames.js";

export function flatWidgets(content) {
  return widgetlistAttributeNames(content).flatMap((attributeName) => {
    const widgets = content.get(attributeName);
    return widgets.map((widget) => {
      const nestedWidgetLists = widgetlistAttributeNames(widget);
      if (nestedWidgetLists.length) {
        return {
          widget,
          nestedContent: flatWidgets(widget)
        };
      } else {
        return widget;
      }
    });
  });
}

export function flatWidgetsList(content) {
  const widgets = flatWidgets(content);
  const flatWidgetsList = [];

  function processWidgets(widgets) {
    widgets.forEach((w) => {
      if (w.nestedContent) {
        flatWidgetsList.push(w.widget);
        processWidgets(w.nestedContent);
      } else {
        flatWidgetsList.push(w);
      }
    });
  }

  processWidgets(widgets);
  return flatWidgetsList;
}