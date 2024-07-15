import * as Scrivito from "scrivito";
import { flatWidgets } from "./flatWidgets.js";

export async function getWidgetsPrompt(obj) {
  const rootWidgets = await Scrivito.load(() =>
    flatWidgets(Scrivito.Obj.root())
  );
  const pageWidgets = await Scrivito.load(() => flatWidgets(obj));
  console.log("pageWidgets", pageWidgets);
  const widgets = {};

  function extractWidgets(w) {
    console.log(w);
    console.log(w._scrivitoPrivateContent.objClass());
    widgets[w._scrivitoPrivateContent.objClass()] = w;
    if (w.nestedContent) {
      w.nestedContent.forEach(extractWidgets);
    }
  }

  pageWidgets.concat(rootWidgets).forEach(extractWidgets);

  console.log("widgets", widgets);
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

export function extractObjClasses(widgets) {
  const classes = [];

  function extract(widget) {
    classes.push(widget.objClass());
    if (widget.nestedContent) {
      widget.nestedContent.forEach(extract);
    }
  }

  widgets.forEach(extract);
  return classes;
}
