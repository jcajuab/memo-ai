"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HighlightContext } from "@/components/memo/highlight-context";

interface AIChatBotProps {
  isSidebar?: boolean;
  transcription?: string;
  chatId: string;
  disabled?: boolean;
}

const INITIAL_ASSISTANT_MESSAGE: UIMessage = {
  id: "assistant-initial",
  role: "assistant",
  content: [
    {
      type: "text",
      text: "Hi! I can help you with questions about your meeting summary. What would you like to know?",
    },
  ],
};

function extractMessageText(message: UIMessage | undefined): string {
  if (!message) {
    return "";
  }

  return message.content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join(" ");
}

function findTimestamp(text: string): string | undefined {
  const match = text.match(/\b(\d{2}:\d{2})\b/);
  return match?.[1];
}

export function AIChatBot({
  isSidebar = false,
  transcription,
  chatId,
  disabled = false,
}: AIChatBotProps) {
  const { setHighlightedTimestamp } = useContext(HighlightContext);
  const [isOpen, setIsOpen] = useState(false);

  const hasTranscription = Boolean(transcription && transcription.trim().length > 0);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/v1/inquire",
      body: () => ({
        transcription: transcription ?? "",
      }),
    });
  }, [transcription]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    stop,
    error,
  } = useChat({
    id: chatId,
    initialMessages: [INITIAL_ASSISTANT_MESSAGE],
    transport,
    onFinish: ({ message }) => {
      const text = extractMessageText(message);
      const timestamp = findTimestamp(text);

      if (timestamp) {
        setHighlightedTimestamp(timestamp);
        setTimeout(() => setHighlightedTimestamp(undefined), 10_000);
      }
    },
  });

  const stopRef = useRef(stop);
  const setInputRef = useRef(setInput);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    setInputRef.current = setInput;
  }, [setInput]);

  useEffect(() => {
    if (!hasTranscription) {
      stopRef.current?.();
      setInputRef.current?.("");
    }
  }, [hasTranscription]);

  const infoBanner = !hasTranscription
    ? "Upload and transcribe an audio file to start asking questions."
    : error
      ? "Something went wrong. Try again or re-upload the transcription."
      : undefined;

  const renderMessageContent = (message: UIMessage) => (
    <div className="space-y-2">
      {message.content.map((part, index) => {
        if (part.type === "text") {
          return (
            <p key={index} className="text-sm leading-relaxed text-foreground">
              {part.text}
            </p>
          );
        }
        return null;
      })}
    </div>
  );

  const messagesList = (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {infoBanner ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
          {infoBanner}
        </div>
      ) : null}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {renderMessageContent(message)}
          </div>
        </div>
      ))}
    </div>
  );

  const InputRow = (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!input.trim() || !hasTranscription || disabled) {
          return;
        }
        void handleSubmit(event);
      }}
    >
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder={hasTranscription ? "Ask a question..." : "Upload transcription to ask questions"}
        className="flex-1"
        disabled={!hasTranscription || isLoading || disabled}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!hasTranscription || isLoading || disabled || !input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );

  if (isSidebar) {
    return (
      <div
        className="h-full flex flex-col border border-primary/30 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="p-4 border-b bg-primary/5">
          <h3 className="font-semibold text-lg">Meeting Assistant</h3>
          <p className="text-sm text-muted-foreground">Ask questions about your meeting</p>
        </div>
        {messagesList}
        <div className="p-4 border-t bg-background">{InputRow}</div>
      </div>
    );
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-50"
          size="icon"
          disabled={!hasTranscription || disabled}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      <div
        className={`fixed bottom-0 right-0 h-[600px] w-full md:w-[400px] bg-background border-l border-t shadow-2xl transition-transform duration-300 ease-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col rounded-none">
          <div className="p-4 border-b bg-primary/5 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">Meeting Assistant</h3>
              <p className="text-sm text-muted-foreground">Ask questions about your meeting</p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Button variant="ghost" size="sm" onClick={() => stop()}>
                  Stop
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  stop();
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {messagesList}
          <div className="p-4 border-t bg-background">{InputRow}</div>
        </div>
      </div>
    </>
  );
}
