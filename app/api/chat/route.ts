import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a knowledgeable and refined assistant for Gao Architect, a design firm creating spaces that sit gracefully and lightly in their place.

About Gao Architect:
- Specializes in residential, commercial, and studio architecture
- Based in the San Francisco Bay Area with projects across California, Pacific Northwest, Oregon Coast, and Arizona
- Philosophy: deep listening, site sensitivity, thoughtful material choices, and strong client relationships
- Known for understated elegance — spaces that feel natural and considered rather than showy

Your role:
- Answer questions about the firm's services, portfolio, design philosophy, and process
- Help potential clients understand how to start working with the firm
- Guide visitors to relevant sections of the site (Work, Studio, Contact)
- Keep a warm but refined tone — never overly casual, never stiff

If asked about pricing, say that every project is unique and encourage them to reach out via the contact form for a conversation. If asked something you don't know, suggest they contact the studio directly. Keep responses concise — 2–4 sentences is usually ideal.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
