import * as Scrivito from "scrivito";

import { flatWidgetsList } from "./flatWidgets.js";
import { widgetlistAttributeNames } from "./widgetlistAttributeNames.js";
import { getPrimaryAttributeName } from "./getPrimaryAttributeName.js";

export function canBeSaved(obj, widgetsDescription) {
  return !!toScrivitoWidgets(obj, widgetsDescription);
}

export async function save(obj, widgetsDescription) {
  const scrivitoWidgets = toScrivitoWidgets(obj, widgetsDescription);
  console.log("widgetsDescription", widgetsDescription);
  const prevWidgets = flatWidgetsList(obj);

  const widgetIds = scrivitoWidgets
    .map(({ widgetId }) => widgetId)
    .filter((w) => !!w);
  const prevWidgetIds = prevWidgets.map((widget) => widget.id());
  const changeWidgetIds = prevWidgetIds.filter((id) => widgetIds.includes(id));

  // edit existing widget
  const editWidgets = scrivitoWidgets.filter(
    ({ widgetId, modification }) =>
      changeWidgetIds.includes(widgetId) && modification === "edit"
  );
  editWidgets.forEach(({ widget, attributes }) => {
    const widgetToUpdate = obj.widgets().find((w) => w.id() === widget.id());
    updateAttributes(widgetToUpdate, attributes);
  });

  // delete existing widget
  const deleteWidgets = scrivitoWidgets.filter(
    ({ widgetId, modification }) =>
      changeWidgetIds.includes(widgetId) && modification === "delete"
  );
  deleteWidgets.forEach(({ widget }) => {
    const widgetToDelete = obj.widgets().find((w) => w.id() === widget.id());
    if (widgetToDelete) widgetToDelete.delete()
  });

  // add new widget
  const hasNewWidgets = scrivitoWidgets.some(
    ({ modification }) => modification === "new"
  );
  const isUpdateOnly =
    !hasNewWidgets && widgetIds.join() === prevWidgetIds.join();
  if (!isUpdateOnly) {
    scrivitoWidgets.forEach((widget, index) => {
      if (widget.modification === 'new'){ // add only new widget
        if (widget.widget.objClass() === "SectionWidget"){ // special treatment for SectionWidget

        }else{
          const previousWidget = scrivitoWidgets[index-1].widget;
          let container = previousWidget;
          if (widgetlistAttributeNames(previousWidget).length === 0) {
            container = previousWidget.container();
          } // get the container if the previousWidget wasn't one
            widgetlistAttributeNames(container).forEach((name) => {
              const widgetsContainerList = container.get(name.toString());
              console.log("widgetsContainerList", widgetsContainerList);
              widgetsContainerList.forEach((widgetContainer, index) => {
                if (widgetContainer.id() === previousWidget.id()) widgetsContainerList.splice(index + 1, 0, widget.widget);
              })
              if (!widgetsContainerList.includes(widget.widget)) widgetsContainerList.splice(0, 0, widget.widget);
              console.log(widgetsContainerList);
              container.update({
                content: [...widgetsContainerList]
              })
            });
        }
      }
    });
    // const newWidgets = [];
    // const previousWidgets = [];
    // let previousWidget = null;
    // scrivitoWidgets.forEach(({ widget, modification }) => {
    //   if (modification === 'new' && previousWidget !== null) {
    //     newWidgets.push(widget);
    //     previousWidgets.push(previousWidget);
    //   }
    //   if (modification === 'edit') previousWidget = widget;
    // });
    // // console.log("newWidgets", newWidgets);
    // // console.log("previousWidgets", previousWidgets);
    // previousWidgets.forEach((prevWidget, index) => {
    //   console.log("prevWidget", prevWidget);
    //   const clearContainer = prevWidget.container();
    //   const newWidget = newWidgets[index];
    //
    //   const attributeName = clearContainer
    //     ? containerAttributeName(clearContainer)
    //     : "body";
    //   // console.log("attributeName", attributeName);
    //   console.log("clearContainer", clearContainer);
    //   console.log("newWidget", newWidget);
    //   widgetlistAttributeNames(clearContainer).forEach((name) => {
    //     // console.log("widget name", clearContainer.get(name.toString()));
    //     // console.log(clearContainer.attributeDefinitions());
    //     // console.log(prevWidget.attributeDefinitions());
    //     clearContainer.update({
    //       content: [...clearContainer.get(name.toString()), newWidget]
    //     })
    //   });
    // });
  }
  await obj.finishSaving();
}

function containerAttributeName(widget) {
  const container = widget.container();
  console.log(container);
  return widgetlistAttributeNames(container).find((name) =>
    container.get(name).some((w) => w.id() === widget.id())
  );
}

function updateAttributes(content, attributes) {
  const primaryAttributeName = getPrimaryAttributeName(content);
  Object.entries(attributes).forEach(([key, rawValue]) => {
    const name =
      key === "_innerHtml" ? primaryAttributeName : key.replace("-title", "");
    if (!name) return;
    const definition = content.attributeDefinitions()[name];
    if (!definition) {
      console.error(`Unknown attribute ${content.objClass()}#${key}`);
      return;
    }

    const [attributeType] = definition;

    const needsCleanup = key === "_innerHtml" && attributeType !== "html";
    const value = needsCleanup ? cleanUp(rawValue, attributeType) : rawValue;

    try {
      switch (attributeType) {
        case "boolean":
          content.update({ [name]: ["true", "yes"].includes(value) });
          break;
        case "enum":
          content.update({ [name]: value || null });
          break;
        case "link":
          const link = content.get(name);
          const fallback = new Scrivito.Link({ url: "#" });
          if (link || value) {
            content.update({
              [name]: (link || fallback).copy({ title: value }),
            });
          }
          break;
        case "float":
        case "integer":
          content.update({ [name]: Number(value) });
          break;
        case "multienum":
        case "stringlist":
          let splitter = " ";
          if (value.includes(", ")) splitter = ", ";
          if (value.includes("; ")) splitter = "; ";
          content.update({ [name]: value.split(splitter).filter((v) => !!v) });
          break;
        default:
          content.update({ [name]: value });
      }
    } catch (e) {
      console.error(e);
    }
  });
}

function cleanUp(rawValue, attributeType) {
  return rawValue.replace(/^\s*<\w+>|<\/\w+>\s*$/g, "").trim();
}

function toScrivitoWidgets(obj, widgetsDescription) {
  if (!widgetsDescription) return undefined;
  const prevWidgets = flatWidgetsList(obj);
  const usedIds = [];
  const newWidgets = widgetsDescription.map(({ id, objClass, ...attributes }) => {
    let existingWidget = prevWidgets.find((w) => w.id() === id);
    if (existingWidget && existingWidget.objClass() === objClass && !usedIds.includes(id)) {
      usedIds.push(id);
      return {
        widget: existingWidget,
        attributes,
        modification: "edit",
        widgetId: id,
      };
    }
    const WidgetClass = Scrivito.getClass(objClass);
    if (!WidgetClass) return null;
    return {
      widget: new WidgetClass({}),
      attributes,
      modification: "new",
    };
  });

  const deleteWidgets = prevWidgets
    .filter((w) => !usedIds.includes(w.nestedContent ? w.widget.id() : w.id()))
    .map((w) => ({
      widget: w,
      modification: "delete",
      widgetId: w.nestedContent ? w.widget.id() : w.id(),
    }));

  return [...newWidgets, ...deleteWidgets];
}

