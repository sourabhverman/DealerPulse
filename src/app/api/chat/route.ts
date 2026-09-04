import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildAIContext } from "@/lib/buildAIContext";

const MODEL = "minimax/minimax-m3:free"; // free tier — MiniMax M3 via OpenRouter

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

  const stream = await client.chat.completions.create({
    model: MODEL,
    stream: true,
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content:
          `You are DealerPulse AI — a sharp, data-driven business analyst for a Toyota dealership group in India. ` +
          `You answer questions from the CEO and branch managers using only the real business data provided below. ` +
          `Be direct, specific, and always cite numbers. Keep answers under 200 words unless a detailed breakdown is needed.\n\n` +
          systemContext,
      },
      ...messages,
    ],
  });

  // Stream the response as Server-Sent Events
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
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
