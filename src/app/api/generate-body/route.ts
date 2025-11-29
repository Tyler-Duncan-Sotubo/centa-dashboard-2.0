import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: Request) {
  const { title, category } = await req.json();

  const prompt = `Write a detailed internal company announcement titled "${title}" for the ${category} department. The body should include at least 150 words, include reasons for the announcement, and any positive messages or calls to action.`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o", // you can adjust model here
    messages: [
      {
        role: "system",
        content:
          "You are an HR assistant helping draft internal announcements.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = chat.choices[0].message.content || "";

  return NextResponse.json({ body: content });
}
