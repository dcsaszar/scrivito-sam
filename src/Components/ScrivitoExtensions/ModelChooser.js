import * as React from "react";
import { availableModels, getModel, setModel } from "./model";

export function ModelChooser() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div
      className={`assist-model-chooser ${isOpen ? "active" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <i className="icon fa-gear"></i>
      {isOpen && <Options />}
    </div>
  );
}

function Options() {
  const [option, setOption] = React.useState("");

  React.useEffect(() => {
    setOption(getModel());
  }, []);

  return availableModels.map((name) => (
    <div
      key="model"
      className={`assist-model-chooser-option ${
        name === option ? "active" : ""
      }`}
      onClick={() => {
        setModel(name);
        setOption(name);
      }}
    >
      {humanReadable(name)}
    </div>
  ));
}

function humanReadable(name) {
  return name.replace(/.*\/|-?\d{5}.*$/g, "");
}
