import { getCloudflareContext } from "@opennextjs/cloudflare";
import { convertToCoreMessages, streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";

import {
  InputSchema,
  OutputSchema,
} from "@/app/(backend)/api/v1/inquire/route.type";

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based ONLY on the provided transcription.

IMPORTANT RULES:
- Only use information from the transcription provided
- If the transcription doesn't contain relevant information to answer the question, say so clearly
- Do not use external knowledge or make assumptions beyond what's in the transcription
- Be concise and specific in your answers
- Quote relevant parts of the transcription when possible`;

export const runtime = "edge";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response("Invalid content type. Expected application/json.", {
      status: 400,
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  // Handle AI SDK useChat payloads (contains messages array)
  if (Array.isArray(body?.messages)) {
    try {
      const transcription = typeof body?.transcription === "string" ? body.transcription : "";

      if (!transcription.trim()) {
        return new Response(
          JSON.stringify({ error: "Missing transcription context for inquiry." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const userMessages = body.messages.filter((message: any) => message?.role === "user");
      const latestUser = userMessages.at(-1);
      const latestQuestion = extractMessageText(latestUser);

      if (!latestQuestion.trim()) {
        return new Response(
          JSON.stringify({ error: "Unable to determine the latest question from chat history." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const workersAI = createWorkersAI({ binding: env.AI });

      const conversation = convertToCoreMessages(body.messages ?? [])
        .filter((message) => message.role !== "system")
        .map((message, index, array) => {
          if (index === array.length - 1 && message.role === "user") {
            return {
              ...message,
              content: `Here is the transcription:\n\n"${transcription}"\n\nQuestion: ${latestQuestion}\n\nPlease answer the question based only on the information in the transcription above.`,
            };
          }
          return message;
        });

      const result = await streamText({
        model: workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversation],
      });

      return result.toUIMessageStreamResponse({
        headers: {
          "Content-Type": "text/x-unknown",
          "content-encoding": "identity",
          "transfer-encoding": "chunked",
        },
        originalMessages: body.messages,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unable to process inquiry request.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Fallback: legacy payload support using InputSchema
  try {
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
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

function extractMessageText(message: any): string {
  if (!message) {
    return "";
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .filter((part) => part && typeof part === "object" && part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join(" ");
  }

  return "";
}

async function collectStreamText(stream: AsyncIterable<string>): Promise<string> {
  let output = "";
  for await (const chunk of stream) {
    output += chunk;
  }
  return output;
}
