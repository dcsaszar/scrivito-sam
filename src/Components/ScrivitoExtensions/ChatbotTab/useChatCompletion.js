import OpenAI from "openai";
import { useMemo, useState } from "react";

export function useChatCompletion({ apiKey, instanceId, model, user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);

  const messagesWithCompletion = useMemo(
    () => (completionMessage ? messages.concat(completionMessage) : messages),
    [messages, completionMessage]
  );

  return {
    loading,
    messages: messagesWithCompletion,
    submitPrompt: (prompt) => {
      setCompletionMessage(null);
      setLoading(true);
      // @ts-ignore
      setMessages((m) => {
        const messagesWithPrompt = [...m, ...prompt];
        startStreaming({
          apiKey,
          instanceId,
          model,
          messages: messagesWithPrompt,
          setCompletionMessage,
          setLoading,
          setMessages,
          user,
        });
        return messagesWithPrompt;
      });
    },
    abortResponse: () => {},
    resetMessages: () => {
      setCompletionMessage(null);
      setMessages([]);
    },
    setMessages,
  };
}

let OPENAI_API_KEY =
  // @ts-ignore
  typeof import.meta.env === "undefined"
    ? // @ts-ignore
      process.env.OPENAI_API_KEY
    : // @ts-ignore
      import.meta.env.OPENAI_API_KEY;

let MISTRAL_API_KEY =
  // @ts-ignore
  typeof import.meta.env === "undefined"
    ? // @ts-ignore
    process.env.MISTRAL_API_KEY
    : // @ts-ignore
    import.meta.env.MISTRAL_API_KEY;

let MODEL =
  // @ts-ignore
  typeof import.meta.env === "undefined"
    ? // @ts-ignore
    process.env.MODEL
    : // @ts-ignore
    import.meta.env.MODEL;

async function startStreaming({
  apiKey,
  instanceId,
  messages,
  model,
  setCompletionMessage,
  setLoading,
  setMessages,
  user,
}) {
  await openaiStreaming({
    apiKey,
    instanceId,
    messages,
    model,
    setCompletionMessage,
    setLoading,
    setMessages,
    user,
  });
}

async function openaiStreaming({
                                 apiKey,
                                 instanceId,
                                 messages,
                                 model,
                                 setCompletionMessage,
                                 setLoading,
                                 setMessages,
                                 user,
                               }) {
  let baseURL = "https://i7ukqy3mhy3nzkn3dutmmzdx440xgtjk.lambda-url.eu-west-1.on.aws?ignore=";

  switch (MODEL) {
    case "mistral" :
      model = "codestral-latest";
      apiKey = MISTRAL_API_KEY ? MISTRAL_API_KEY : apiKey;
      baseURL = MISTRAL_API_KEY ? "https://api.mistral.ai/v1" : baseURL;
      break;
    case "openai" :
      model = "gpt-4o"
      apiKey = OPENAI_API_KEY ? OPENAI_API_KEY : apiKey;
      baseURL = OPENAI_API_KEY ? "https://api.openai.com/v1" : baseURL;
      break;
    default :
      model = "gpt-4o"
      apiKey = OPENAI_API_KEY ? OPENAI_API_KEY : apiKey;
      baseURL = OPENAI_API_KEY ? "https://api.openai.com/v1" : baseURL;
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,

    defaultQuery: { tenant_id: instanceId },
    defaultHeaders: { Accept: "*/*" },
    dangerouslyAllowBrowser: true,
    fetch: async (url, init) => {
      return fetch(url, {
        ...init,
        headers: cleanHeaders(init?.headers),
      });
    },
  });

  console.log("messages", messages);
  const response = await client.beta.chat.completions.stream({
    model,
    messages,
    stream: true,
  }); // we cannot have the user parameter with mistral otherwise it cannot read the body

  // stream.on("content", () => {
  //   const message = stream.currentChatCompletionSnapshot?.choices[0].message;
  //   if (message) setCompletionMessage(message);
  // });
  //
  // return stream.finalChatCompletion().then(({ choices }) => {
  //   setCompletionMessage(null);
  //   setMessages(messages.concat(choices[0].message));
  //   setLoading(false);
  // });
  let fullMessage = '';
  for await (const chunk of response) {
    const message = chunk.choices[0]?.delta?.content;
    if (message) {
      fullMessage += message;
      setCompletionMessage({ content: fullMessage, role: 'assistant' });
    }
  }

  setCompletionMessage(null);
  setMessages(messages.concat({ content: fullMessage, role: 'assistant' }));
  setLoading(false);
}

function cleanHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers)
      .filter(([k]) => !k.startsWith("x-"))
      .map(([k, v]) => [
        k
          .replace("content-type", "Content-Type")
          .replace("authorization", "Authorization")
          .replace("accept", "Accept"),
        v,
      ])
  );
}