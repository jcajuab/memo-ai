import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  InputSchema,
  OutputSchema,
} from "@/app/(backend)/api/v1/inquire/route.type";

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
        content: `You are a helpful assistant that answers questions based ONLY on the provided transcription. 
        
        IMPORTANT RULES:
        - Only use information from the transcription provided
        - If the transcription doesn't contain relevant information to answer the question, say so clearly
        - Do not use external knowledge or make assumptions beyond what's in the transcription
        - Be concise and specific in your answers
        - Quote relevant parts of the transcription when possible`,
      },
      {
        role: "user",
        content: `Here is the transcription:

"${input.transcription}"

Question: ${input.question}

Please answer the question based only on the information in the transcription above.`,
      },
    ];

    // Call Cloudflare AI Llama model
    const aiResponse = await env.AI.run(
      "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
      {
        messages,
      }
    );

    // Extract the response text from AI response
    const responseText =
      typeof aiResponse === "string"
        ? aiResponse
        : aiResponse?.response || JSON.stringify(aiResponse);

    // Validate and return structured output
    const output = OutputSchema.parse({
      response: responseText,
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
