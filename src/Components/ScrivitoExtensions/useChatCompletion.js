import OpenAI from "openai";
import { useMemo, useState } from "react";

export function useChatCompletion({ getApiKey, instanceId, model, user }) {
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
          getApiKey,
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

let OPENAI_API_KEY;
if (typeof process !== "undefined") {
  OPENAI_API_KEY = process.env.OPENAI_API_KEY;
}
// @ts-ignore
if (typeof import.meta.env !== "undefined") {
  // @ts-ignore
  OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
}

async function startStreaming({
  getApiKey,
  instanceId,
  messages,
  model,
  setCompletionMessage,
  setLoading,
  setMessages,
  user,
}) {
  let content = "";
  let role = null;
  let message = null;
  let finishReason;

  do {
    const client = new OpenAI({
      apiKey: OPENAI_API_KEY || (await getApiKey?.()),
      baseURL: OPENAI_API_KEY
        ? "https://api.openai.com/v1"
        : "https://6dyoi7w4yzq2bta2fh5hubtd4a0lnozo.lambda-url.eu-central-1.on.aws/v1",

      defaultQuery: { instance_id: instanceId },
      dangerouslyAllowBrowser: true,
    });

    finishReason = null;
    let stream;

    try {
      stream = await client.chat.completions.create({
        model,
        messages: message ? messages.concat(message) : messages,
        stream: true,
        user,
      });
    } catch (error) {
      setCompletionMessage(null);
      setMessages(
        messages.concat({ role: "assistant", content: error.toString() })
      );
      setLoading(false);
      return;
    }

    for await (const chunk of stream) {
      const { delta, finish_reason } = chunk.choices[0];
      finishReason = finish_reason;
      role ||= delta.role;
      if (delta.content) {
        content += delta.content;
        setCompletionMessage({ role, content });
      }
      message = { role, content };
    }
  } while (finishReason === "length" && content.length < MAX_OUTPUT_TOKENS * 4);

  setCompletionMessage(null);
  setMessages(messages.concat(message));
  setLoading(false);
}

const MAX_OUTPUT_TOKENS = 32_000;
