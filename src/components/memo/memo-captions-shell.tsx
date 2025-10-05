"use client";

import { useMemo, useState } from "react";

import { MemoFileDropzone } from "@/components/memo/file-dropzone";
import { MemoHeader } from "@/components/memo/header";
import { HighlightContext } from "@/components/memo/highlight-context";
import { AIChatBot } from "@/components/memo/ai-chat-bot";
import { TranscriptionResults } from "@/components/memo/transcription-results";
import type { TranscriptionResponse } from "@/services/transcription.service";
import {
  DEFAULT_KEY_POINTS,
  buildDynamicKeyPoints,
} from "@/components/memo/transcription-data";

export function MemoCaptionsShell() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState<string | undefined>();
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);

  const keyPoints = useMemo(() => {
    if (!transcription) {
      return DEFAULT_KEY_POINTS;
    }

    const generated = buildDynamicKeyPoints(transcription);
    return generated.length > 0 ? generated : DEFAULT_KEY_POINTS;
  }, [transcription]);

  return (
    <HighlightContext.Provider
      value={{ highlightedTimestamp, setHighlightedTimestamp }}
    >
      <div
        className="flex h-full flex-col overflow-hidden"
        style={{ background: "var(--gradient-subtle)" }}
      >
        <MemoHeader />
        <main className="container mx-auto flex flex-1 flex-col overflow-hidden px-6">
          <div className="flex flex-1 flex-col overflow-hidden py-6">
            {!uploadedFile ? (
              <div className="flex flex-1 flex-col items-center justify-start gap-8">
                <div className="max-w-2xl text-center">
                  <h1 className="text-4xl font-bold text-foreground md:text-5xl">
                    AI Audio Transcription
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Transform your audio recordings into accurate text transcriptions with the power of AI.
                  </p>
                </div>
                <div className="w-full max-w-2xl">
                  <MemoFileDropzone
                    onFileReady={(file) => {
                      setUploadedFile(file);
                      if (!file) {
                        setTranscription(null);
                      }
                    }}
                    onTranscriptionComplete={setTranscription}
                  />
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[1fr_420px]">
                <div className="flex min-h-0 flex-col space-y-4">
                  <MemoFileDropzone
                    onFileReady={(file) => {
                      setUploadedFile(file);
                      if (!file) {
                        setTranscription(null);
                      }
                    }}
                    onTranscriptionComplete={setTranscription}
                  />
                  <TranscriptionResults
                    highlightedTimestamp={highlightedTimestamp}
                    transcription={transcription}
                    keyPoints={keyPoints}
                  />
                </div>
                <AIChatBot isSidebar keyPoints={keyPoints} />
              </div>
            )}
          </div>
        </main>
      </div>
    </HighlightContext.Provider>
  );
}
