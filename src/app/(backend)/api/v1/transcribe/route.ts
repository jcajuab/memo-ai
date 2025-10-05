import { getCloudflareContext } from "@opennextjs/cloudflare";
import { InputSchema, OutputSchema } from "@/app/(backend)/api/v1/transcribe/route.type";

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

    // Validate and return structured output
    const output = OutputSchema.parse({
      input: { audio: [] },
      response,
    });

    return Response.json(output);
    
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}