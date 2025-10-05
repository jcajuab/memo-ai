"use client";

import { createContext } from "react";

export interface HighlightContextValue {
  highlightedTimestamp: string | undefined;
  setHighlightedTimestamp: (timestamp: string | undefined) => void;
}

export const HighlightContext = createContext<HighlightContextValue>({
  highlightedTimestamp: undefined,
  setHighlightedTimestamp: () => undefined,
});
