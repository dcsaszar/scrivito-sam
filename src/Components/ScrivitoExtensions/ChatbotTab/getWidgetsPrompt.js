import * as Scrivito from "scrivito";
import { flatWidgetsList } from "./flatWidgets.js";

export async function getWidgetsPrompt(obj) {
  const rootWidgets = await Scrivito.load(() =>
    flatWidgetsList(Scrivito.Obj.root())
  );
  const pageWidgets = await Scrivito.load(() => flatWidgetsList(obj));
  const widgets = {};
  pageWidgets.concat(rootWidgets).forEach((w) => (widgets[w.objClass()] = w));

  return Object.entries(widgets)
    .map(([className, widget]) => {
      const data = [];
      Object.entries(widget.attributeDefinitions()).forEach(
        ([attributeName, [attributeType, { values }]]) => {
          if (
            ["enum", "multienum", "boolean", "float", "integer"].includes(
              attributeType
            )
          ) {
            const availableValues =
              values ||
              {
                boolean: ["true", "false"],
                float: ["[some number]"],
                integer: ["some integer number"],
              }[attributeType];
            data.push(`data-${attributeName}="${availableValues.join("|")}"`);
          }
        }
      );
      return `  * <widget type="${className} ${data.join(" ")}">...</widget>`;
    })
    .join("\n");
}
