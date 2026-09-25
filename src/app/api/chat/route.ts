import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildAIContext } from "@/lib/buildAIContext";

// Tried in order — first one that responds without error wins
const MODELS = [
  "nex-agi/nex-n2.5-pro:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not set in .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://dealerpulse.vercel.app",
      "X-Title": "DealerPulse",
    },
  });

  const systemContext = buildAIContext();

  const systemMessage = {
    role: "system" as const,
    content:
      `You are DealerPulse AI — a sharp, data-driven business analyst for a Toyota dealership group in India. ` +
      `You answer questions from the CEO and branch managers using only the real business data provided below. ` +
      `Be direct, specific, and always cite numbers. Keep answers under 200 words unless a detailed breakdown is needed.\n\n` +
      systemContext,
  };

  // Try each model in order until one succeeds
  let stream: AsyncIterable<any> | null = null;
  let lastError = "";

  for (const model of MODELS) {
    try {
      stream = await client.chat.completions.create({
        model,
        stream: true,
        max_tokens: 1200,
        messages: [systemMessage, ...messages],
      });
      break; // success — stop trying
    } catch (e: any) {
      lastError = e?.message ?? String(e);
      // 429 = rate limited, 404 = model gone, 503 = unavailable — all worth retrying next
      continue;
    }
  }

  if (!stream) {
    return new Response(
      JSON.stringify({ error: `All models unavailable. Last error: ${lastError}` }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream the response as Server-Sent Events
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream!) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
