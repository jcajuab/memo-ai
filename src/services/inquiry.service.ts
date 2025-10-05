import type { z } from "zod";
import { OutputSchema } from "@/app/(backend)/api/v1/inquire/route.type";

export type InquireResponse = z.infer<typeof OutputSchema>;

const API_ENDPOINT = "/api/v1/inquire";

/**
 * Ask AI questions based on a transcription
 */
export async function inquireFromTranscription(
  transcription: string,
  question: string
): Promise<InquireResponse> {
  // Validate inputs
  if (!transcription.trim()) {
    throw new Error("Transcription cannot be empty");
  }
  if (!question.trim()) {
    throw new Error("Question cannot be empty");
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcription,
        question,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inquiry failed: ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    return OutputSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during inquiry");
  }
}
