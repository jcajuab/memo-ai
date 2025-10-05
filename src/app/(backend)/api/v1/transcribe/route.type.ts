import { z } from "zod";

const MAX_INTEGER_VALUE = 255; // Max value for a byte

// Schema for input validation
export const InputSchema = z.object({
  audio: z.array(z.number().int().min(0).max(MAX_INTEGER_VALUE)).nonempty(),
});

// Schema for output validation
const WordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

const TranscriptionResponseSchema = z.object({
  text: z.string(),
  word_count: z.number(),
  vtt: z.string(),
  words: z.array(WordSchema),
});

export const OutputSchema = z.object({
  input: z.object({
    audio: z.array(z.number()).default([]),
  }),
  response: TranscriptionResponseSchema,
});
