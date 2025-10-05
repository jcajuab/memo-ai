import { z } from "zod";

// Schema for input validation
export const InputSchema = z.object({
  transcription: z.string().min(1, "Transcription cannot be empty"),
});

// Schema for AI response
const AIResponseSchema = z.object({
  response: z.string(),
});

// Schema for output validation
export const OutputSchema = z.object({
  response: z.string(), // Direct string response from AI, not wrapped in object
});

// Export types
export type InputType = z.infer<typeof InputSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type OutputType = z.infer<typeof OutputSchema>;
