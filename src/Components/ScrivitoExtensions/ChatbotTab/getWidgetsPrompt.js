import * as Scrivito from "scrivito";
import { flatWidgets } from "./flatWidgets.js";

export async function getWidgetsPrompt(obj) {
  const rootWidgets = await Scrivito.load(() =>
    flatWidgets(Scrivito.Obj.root())
  );
  const pageWidgets = await Scrivito.load(() => flatWidgets(obj));
  const widgets = {};

  function extractWidgets(w) {
    console.log(w);
    widgets[w.objClass()] = w;
    if (w.nestedContent) {
      w.nestedContent.forEach(extractWidgets);
    }
  }

  pageWidgets.concat(rootWidgets).forEach(extractWidgets);

  console.log(widgets);
  return Object.entries(widgets)
    .map(([className, widget]) => {
      const data = [];
      console.log(widget);
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
