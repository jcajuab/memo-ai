import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

// Schema for input validation
const InputSchema = z.object({
  audio: z.array(z.number().int().min(0).max(255)).nonempty(),
});

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    
    // Verify content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("audio/mpeg")) {
      return new Response("Invalid content type. Expected audio/mpeg.", { status: 400 });
    }

    // Read the uploaded MP3
    const blob = await request.arrayBuffer();
    const audioArray = [...new Uint8Array(blob)].filter(n => Number.isFinite(n));

    // Sanitize and validate input
    const input = InputSchema.parse({ audio: audioArray });

    // Run Whisper model
    const response = await env.AI.run("@cf/openai/whisper", input);

    return Response.json({ input: { audio: [] }, response });
    
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}