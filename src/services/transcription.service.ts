import type { z } from "zod";
import { OutputSchema } from "@/app/(backend)/api/v1/transcribe/route.type";

export type TranscriptionResponse = z.infer<typeof OutputSchema>;

const API_ENDPOINT = "/api/v1/transcribe";

/**
 * Upload an MP3 file for transcription using Cloudflare Workers AI
 */
export async function transcribe(file: File): Promise<TranscriptionResponse> {
  // Validate file type
  if (!file.type.includes("audio/mpeg")) {
    throw new Error("Invalid file type. Expected audio/mpeg (MP3).");
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    return OutputSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during transcription");
  }
}

/**
 * Upload a Blob as MP3 for transcription
 */
export async function transcribeBlob(
  blob: Blob
): Promise<TranscriptionResponse> {
  const file = new File([blob], "audio.mp3", { type: "audio/mpeg" });
  return await transcribe(file);
}
