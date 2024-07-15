import * as Scrivito from "scrivito";
import { flatWidgets } from "./flatWidgets.js";

export async function getWidgetsPrompt(obj) {
  const rootWidgets = await Scrivito.load(() =>
    flatWidgets(Scrivito.Obj.root())
  );
  const pageWidgets = await Scrivito.load(() => flatWidgets(obj));
  const widgets = {};

  function extractWidgets(w) {
    if (w.nestedContent) {
      widgets[w.widget.objClass()] = w.widget;
      w.nestedContent.forEach(extractWidgets);
    }else{
      widgets[w.objClass()] = w;
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
      console.log("ici");
      return `  * <widget type="${className} ${data.join(" ")}">...</widget>`;
    })
    .join("\n");
}
