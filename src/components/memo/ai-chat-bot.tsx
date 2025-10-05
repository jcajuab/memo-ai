"use client";

import { useContext, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HighlightContext } from "@/components/memo/highlight-context";
import type { KeyPoint } from "@/components/memo/transcription-data";

interface AIChatBotProps {
  isSidebar?: boolean;
  keyPoints?: KeyPoint[];
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export function AIChatBot({ isSidebar = false, keyPoints = [] }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you with questions about your meeting summary. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const { setHighlightedTimestamp } = useContext(HighlightContext);

  const responseTemplates = useMemo(
    () => [
      {
        keywords: ["ai", "transcription", "accuracy"],
        fallbackTimestamp: "05:42",
        template: (timestamp: string) =>
          `The AI transcription feature achieved a 95% accuracy rate. You can read more about this at timestamp ${timestamp}.`,
      },
      {
        keywords: ["budget", "hiring", "engineer"],
        fallbackTimestamp: "12:30",
        template: (timestamp: string) =>
          `The budget for hiring two senior engineers and one product designer was approved. Check timestamp ${timestamp} for details.`,
      },
      {
        keywords: ["marketing", "campaign", "launch"],
        fallbackTimestamp: "18:05",
        template: (timestamp: string) =>
          `The marketing campaign is scheduled to launch on November 15th. See timestamp ${timestamp} for the full strategy.`,
      },
      {
        keywords: ["mobile", "app", "beta"],
        fallbackTimestamp: "28:50",
        template: (timestamp: string) =>
          `The mobile app beta launch is planned for end of Q4. More details at timestamp ${timestamp}.`,
      },
      {
        keywords: ["roadmap", "product", "q4"],
        fallbackTimestamp: "02:15",
        template: (timestamp: string) =>
          `The Q4 product roadmap focuses on AI-powered features and mobile app development. See timestamp ${timestamp}.`,
      },
    ],
    [],
  );

  const findTimestampForKeywords = (keywords: string[]): string | undefined => {
    if (!keyPoints.length) {
      return undefined;
    }

    const lowerKeyPoints = keyPoints.map((point) => ({
      timestamp: point.timestamp,
      text: point.text.toLowerCase(),
    }));

    const match = lowerKeyPoints.find((point) =>
      keywords.some((keyword) => point.text.includes(keyword)),
    );

    return match?.timestamp;
  };

  const findResponse = (query: string) => {
    const lower = query.toLowerCase();
    const template = responseTemplates.find((entry) =>
      entry.keywords.some((keyword) => lower.includes(keyword)),
    );

    if (template) {
      const dynamicTimestamp =
        findTimestampForKeywords(template.keywords) ?? template.fallbackTimestamp;
      return {
        content: template.template(dynamicTimestamp),
        timestamp: dynamicTimestamp,
      };
    }

    return {
      content:
        "I can help you find information in the meeting. Try asking about the AI features, budget, marketing campaign, or product roadmap!",
      timestamp: keyPoints[0]?.timestamp,
    };
  };

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    const question = input;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");

    setTimeout(() => {
      const response = findResponse(question);
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);

      if (response.timestamp) {
        setHighlightedTimestamp(response.timestamp);
        setTimeout(() => setHighlightedTimestamp(undefined), 10_000);
      }
    }, 400);
  };

  const InputRow = (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask a question..."
        className="flex-1"
      />
      <Button onClick={handleSend} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );

  const Messages = (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
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
        {Messages}
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
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {Messages}
          <div className="p-4 border-t bg-background">{InputRow}</div>
        </div>
      </div>
    </>
  );
}
