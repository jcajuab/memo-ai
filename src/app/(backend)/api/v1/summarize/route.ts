import { InputSchema, OutputSchema } from "@/app/(backend)/api/v1/inquire/route.type";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();

    // Verify content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response("Invalid content type. Expected application/json.", {
        status: 400,
      });
    }

    // Parse and validate input
    const body = await request.json();
    const input = InputSchema.parse(body);

    // Prepare messages for AI model
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that creates concise and informative summaries of transcribed content.

        IMPORTANT RULES:
        - Create a clear, structured summary of the provided transcription
        - Focus on the main points, key topics, and important details
        - Organize the summary in a logical flow
        - Use bullet points or sections when appropriate for clarity
        - Maintain the original meaning and context
        - Keep the summary concise but comprehensive`,
      },
      {
        role: "user",
        content: `Please summarize the following transcription:

"${input.transcription}"

Provide a well-structured summary that captures the main points and key information from the transcription.`,
      },
    ];

    // Call Cloudflare AI Llama model
    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages,
      }
    );

    // Validate and return structured output
    const output = OutputSchema.parse({
      response,
    });

    return Response.json(output);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
