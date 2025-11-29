import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: Request) {
  const { name, jobTitle } = await req.json();

  const prompt = `
You are a professional HR assistant. Write a warm, professional **interview invitation email body** using Handlebars-style placeholders for ${{
    name,
  }} and ${{ jobTitle }}.

**Important rules:**
- Use Markdown format.
- DO NOT include a subject line.
- Use these exact handlebars variables:
  {{candidateName}}, {{stage}}, {{jobTitle}}, {{companyName}},
  {{interviewDate}}, {{interviewTime}}, {{interviewMode}}, {{meetingLink}}, {{recruiterName}}

The email should look like a real message from a recruiter. Keep it friendly, concise, and clear.
Only return the **email body** wrapped in markdown.
`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that writes professional email templates.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const markdown = chat.choices[0]?.message?.content?.trim() || "";

  if (!markdown) {
    return NextResponse.json(
      { error: "No content returned from AI" },
      { status: 500 }
    );
  }

  return NextResponse.json({ body: markdown });
}
