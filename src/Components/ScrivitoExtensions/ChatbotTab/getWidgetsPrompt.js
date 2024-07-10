import * as Scrivito from "scrivito";
import { flatWidgets } from "./flatWidgets.js";

export async function getWidgetsPrompt(obj) {
  const rootWidgets = await Scrivito.load(() =>
    flatWidgets(Scrivito.Obj.root())
  );
  const pages = await Scrivito.load(() => {
    let children = Scrivito.Obj.root().children();
    // const page = children.find(child => child.get("title") === "Product")
    console.log(children.find(child => child.get("title") === "Product"));
    // for (let child of children) {
    //   console.log(child.get("title"));
    //
    // }
  });
  console.log(pages);
  console.log("rootWidgets", rootWidgets);
  console.log("obj", obj);
  const pageWidgets = await Scrivito.load(() => flatWidgets(obj));
  console.log("pageWidgets", pageWidgets);
  const widgets = {};
  pageWidgets.concat(rootWidgets).forEach((w) => (widgets[w.objClass()] = w));

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
