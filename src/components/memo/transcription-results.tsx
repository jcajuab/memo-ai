"use client";

import { useMemo, useState } from "react";

import type { TranscriptionResponse } from "@/services/transcription.service";
import {
  DEFAULT_KEY_POINTS,
  DEFAULT_SUMMARY,
  buildDynamicKeyPoints,
  type KeyPoint,
} from "@/components/memo/transcription-data";

interface TranscriptionResultsProps {
  highlightedTimestamp?: string;
  transcription?: TranscriptionResponse | null;
  keyPoints?: KeyPoint[];
}

export function TranscriptionResults({
  highlightedTimestamp,
  transcription,
  keyPoints,
}: TranscriptionResultsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    keypoints: true,
  });

  const summaryText = transcription?.response.text?.trim() || DEFAULT_SUMMARY;

  const dynamicKeyPoints = useMemo(() => {
    if (keyPoints && keyPoints.length > 0) {
      return keyPoints;
    }

    if (!transcription) {
      return DEFAULT_KEY_POINTS;
    }

    const generated = buildDynamicKeyPoints(transcription);
    return generated.length > 0 ? generated : DEFAULT_KEY_POINTS;
  }, [keyPoints, transcription]);

  const wordCount = transcription?.response.word_count;

  const toggleSection = (section: "summary" | "keypoints") => {
    setOpenSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
        <details
          open={openSections.summary}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <summary
            className="px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4"
            onClick={(event) => {
              event.preventDefault();
              toggleSection("summary");
            }}
          >
            <h3 className="text-2xl font-bold text-primary">Meeting Summary</h3>
            <span className="text-sm text-muted-foreground">
              {openSections.summary ? "Hide" : "Show"}
            </span>
          </summary>
          {openSections.summary ? (
            <div className="px-6 pb-6 space-y-3">
              {wordCount ? (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {wordCount.toLocaleString()} words processed
                </p>
              ) : null}
              <p className="text-foreground leading-relaxed">{summaryText}</p>
            </div>
          ) : null}
        </details>

        <details
          open={openSections.keypoints}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <summary
            className="px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-4"
            onClick={(event) => {
              event.preventDefault();
              toggleSection("keypoints");
            }}
          >
            <h3 className="text-2xl font-bold text-primary">Key Points</h3>
            <span className="text-sm text-muted-foreground">
              {openSections.keypoints ? "Hide" : "Show"}
            </span>
          </summary>
          {openSections.keypoints ? (
            <div className="px-6 pb-6 max-h-[400px] overflow-y-auto">
              <ul className="space-y-4">
                {dynamicKeyPoints.map((point, index) => {
                  const isHighlighted = highlightedTimestamp === point.timestamp;
                  return (
                    <li key={point.timestamp} className="space-y-3">
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-start pb-1">
                        <span className="text-foreground leading-relaxed">{point.text}</span>
                        <span
                          className={`text-xs font-semibold font-mono px-2 py-1 rounded whitespace-nowrap transition-all duration-300 ${
                            isHighlighted
                              ? "bg-green-500 text-white border-2 border-green-600 shadow-lg scale-110"
                              : "text-primary bg-primary/15 border border-primary/40"
                          }`}
                        >
                          {point.timestamp}
                        </span>
                      </div>
                      {index < dynamicKeyPoints.length - 1 ? (
                        <hr className="border-primary/20" />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </details>
      </div>
    </div>
  );
}
