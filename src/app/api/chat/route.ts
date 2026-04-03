import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { HENLEY_SYSTEM_PROMPT } from "@/lib/system-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: HENLEY_SYSTEM_PROMPT,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    });

    const textContent = response.content.find((block) => block.type === "text");
    const text = textContent ? textContent.text : "";

    // Check if the conversation is complete by looking for the JSON block
    let leadData = null;
    let displayText = text;

    const jsonMatch = text.match(/```json:lead_data\n([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        leadData = JSON.parse(jsonMatch[1]);
        displayText = text.replace(/```json:lead_data\n[\s\S]*?```/, "").trim();
      } catch {
        // JSON parse failed, just show the full text
      }
    }

    return NextResponse.json({
      message: displayText,
      leadData,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
