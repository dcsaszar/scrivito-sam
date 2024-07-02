import OpenAI from "openai";
import MistralClient from "@mistralai/mistralai";
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

let MISTRAL_API_KEY = "jrJsuWD6oWpC1ARmXGcEVZCz187zQu77"

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

  switch (model) {
    case "openai":
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
      break;
    case "mistral":
      throw Error("Unknown service.");
    default:
      await mistralStreaming({
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
  const client = new OpenAI({
    apiKey: OPENAI_API_KEY || apiKey,
    baseURL: OPENAI_API_KEY
      ? "https://api.openai.com/v1"
      : "https://i7ukqy3mhy3nzkn3dutmmzdx440xgtjk.lambda-url.eu-west-1.on.aws?ignore=",

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

  const stream = await client.beta.chat.completions.stream({
    model,
    messages,
    stream: true,
    user,
  });

  stream.on("content", () => {
    const message = stream.currentChatCompletionSnapshot?.choices[0].message;
    if (message) setCompletionMessage(message);
  });

  return stream.finalChatCompletion().then(({ choices }) => {
    setCompletionMessage(null);
    setMessages(messages.concat(choices[0].message));
    setLoading(false);
  });
}

async function mistralStreaming({
                                 apiKey,
                                 instanceId,
                                 messages,
                                 model,
                                 setCompletionMessage,
                                 setLoading,
                                 setMessages,
                                 user,
                               }) {
  apiKey = MISTRAL_API_KEY || apiKey;

  console.log(apiKey);
  //
  // let endpoint = MISTRAL_API_KEY
  //   ? "/chat/completions"
  //   : "https://i7ukqy3mhy3nzkn3dutmmzdx440xgtjk.lambda-url.eu-west-1.on.aws?ignore=";
  //
  // console.log(endpoint);

  const client = new MistralClient(apiKey);

  console.log(client);

  const stream = await client.chatStream({
    model,
    messages,
  });

  console.log(stream);

  console.log('Chat Stream:');
  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content !== undefined) {
      const streamText = chunk.choices[0].delta.content;
      console.log(streamText);
    }
  }

  return null;
}
