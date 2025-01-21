import "../../../style.scss";

import * as React from "react";
import * as Scrivito from "scrivito";
import { localize, replace } from "./languages";
import { useChatCompletion } from "../useChatCompletion";
import { getModel } from "../model";
import { updateObj } from "./updateObj";
import { actions, prompts } from "./prompts";
import { extract, getWidgetsAsArray } from "./extractContent";
import { ModelChooser } from "../ModelChooser";

export function LanguageToolsTab({ obj }) {
  const uiContext = Scrivito.uiContext();
  const editor = Scrivito.currentEditor();
  const locale = Scrivito.editorLanguage() || "en";
  const [chatOnly, setChatOnly] = React.useState(true);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // @ts-ignore
  const token = Scrivito.currentEditor()?.authToken();

  const { messages, loading, submitPrompt, resetMessages } = useChatCompletion({
    model: getModel(),
    apiKey: token,
    user: editor?.id(),
    instanceId: Scrivito.getInstanceId(),
  });

  if (!uiContext || !editor) return null;

  const objVersions = obj
    .versionsOnAllSites()
    .filter((v) => v.id() !== obj.id())
    .concat(obj);

  const versionsInput = objVersions
    .map((v) =>
      replace(prompts.objDescription, {
        LANGUAGE: languageName("en", v.language()),
        PAGE:
          v.id() === obj.id()
            ? `the current page (${languageName(
                "en",
                v.language()
              )} version of the page)`
            : `the ${languageName("en", v.language())} version of the page`,
        STRUCTURE: extract(v, { includeIds: v.id() === obj.id() }),
        TEXT: Scrivito.extractText(v),
        TITLE: v.get("title"),
      })
    )
    .join("\n\n");

  const objTitle = obj.get("title");
  const objText = Scrivito.extractText(obj);
  const objStructure = extract(obj);
  const objLanguage = obj.language();

  const contentsForUpdate = [obj, ...getWidgetsAsArray(obj)];

  const localizeArgs = {
    LANGUAGE: languageName("en", objLanguage),
    TOPICS: actions
      .filter(({ topic }) => topic)
      .map(({ topic }) =>
        replace(topic, { LANGUAGE: languageName("en", objLanguage) })
      )
      .join(", "),
    USERLANGUAGE: languageName("en", locale),
    LOCALIZEDPAGELANGUAGE: languageName(locale, objLanguage),
  };

  const message = messages
    .filter(({ role }) => role === "assistant")
    .map(({ content }) => content)
    .join("\n");

  if (!loading && isSubmitted) console.log(message);

  return (
    <div className={`scrivito_${uiContext.theme}`}>
      <div className="assist-dialog-wrapper">
        <ModelChooser />
        {actions.map((action, i) => (
          <React.Fragment key={i}>
            {action.separator ? (
              <div className="label">
                {localize(locale, `${action.separator}Heading`, localizeArgs)}
              </div>
            ) : (
              <button className="btn" onClick={() => run(action)}>
                {localize(locale, action.name, localizeArgs)}
              </button>
            )}
          </React.Fragment>
        ))}
        {chatOnly && isSubmitted && (
          <ChatResponse message={message} loading={loading} />
        )}
        {!chatOnly && isSubmitted && (
          <StructuredResponse
            update={(parts) => updateObj(contentsForUpdate, parts)}
            message={message}
            loading={loading}
            locale={locale}
          />
        )}
      </div>
    </div>
  );

  async function run(action) {
    const args = {
      ...localizeArgs,
      LANGUAGE: languageName("en", objLanguage),
      TEXT: objText,
      TITLE: objTitle,
      TOPIC: replace(action.topic, localizeArgs),
    };
    const promptArgs = {
      ...args,
      ...(await Scrivito.load(() => ({
        INSTRUCTIONS: replace(action.instructions, args),
        RESPONSETYPEINSTRUCTIONS: action.chatOnly
          ? replace(prompts.chatResponse, args)
          : replace(prompts.structuredResponse, args),
        STRUCTURE: objStructure,
        USEREMAIL: editor?.email() || "???",
        USERLANGUAGE: languageName("en", locale),
        USERNAME: editor?.name() || "???",
        VERSIONS: versionsInput,
      }))),
    };
    const systemPrompt = replace(prompts.systemPrompt, promptArgs);
    const userPrompt = replace(prompts.userPrompt, promptArgs);

    setChatOnly(action.chatOnly);
    resetMessages();
    setIsSubmitted(true);
    console.log(systemPrompt, userPrompt);
    submitPrompt([
      { content: systemPrompt, role: "system" },
      { content: userPrompt, role: "user" },
    ]);
  }
}

function ChatResponse({ message, loading }) {
  return (
    <div>
      <div className="role">
        <span className="avatar">🗣️ </span>
        Noam
      </div>
      <div className="chat-message">{message}</div>
      {loading && <div className="loading">…</div>}
    </div>
  );
}

function StructuredResponse({ update, message, loading, locale }) {
  const messageParts = message
    .split(/<!--/)
    .map((part) => {
      const [meta, value] = part.replace(/```.*$/, "").split("-->");
      const [objClass, id, attributeName] = meta.trim().split(/:|-/);
      if (value === undefined || !id || !attributeName) return null;
      return {
        attributeName,
        id,
        objClass,
        value: value?.trim() || "",
      };
    })
    .filter((part) => part);

  const messagePartsCount = messageParts.length;
  const expectedNumberOfChanges = messagePartsCount + 2;
  const percent = loading
    ? Math.floor((100 * messagePartsCount) / expectedNumberOfChanges)
    : 100;

  React.useEffect(() => {
    update(messageParts);
  }, [message]);

  const label = localize(locale, "approxChanges", {
    COUNT: loading ? expectedNumberOfChanges : messagePartsCount,
    PERCENT: percent.toString(),
  });

  return (
    <div>
      <div className="role">
        <span className="avatar">✍️ </span>
        Noam
      </div>
      <div className="loading progress-bar">
        <span className="percentage" style={{ width: `${percent}%` }} />
        {label}
      </div>
    </div>
  );
}

function languageName(locale, languageCode) {
  return (
    new Intl.DisplayNames(locale, { type: "language" })
      .of(languageCode)
      ?.toString() || languageCode
  );
}
