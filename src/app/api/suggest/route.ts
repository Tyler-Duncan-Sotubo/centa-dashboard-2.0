import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: Request) {
  const { jobTitle, category, experience, employmentType, experienceLevel } =
    await req.json();

  const prompt = `
    You are a professional HR and job content writer. Create a realistic and detailed job profile based on the following inputs:
    
    - **Job Title**: ${jobTitle}
    - **Category/Field**: ${category}
    - **Experience Required**: ${experience} years
    - **Employment Type**: ${employmentType} (e.g., full-time, part-time, contract)
    - **Experience Level**: ${experienceLevel} (e.g., entry-level, mid-level, senior-level)
    
    Please return a job description in the following JSON format:
    
    {
      "description": "A single paragraph with at least 100 words describing the role, expectations, tools/technologies involved, and team/culture context.",
      "requirements": [
        "5 concise bullet points focusing on required qualifications, tools/skills, or certifications."
      ],
      "responsibilities": [
        "5 concise bullet points focusing on daily tasks, contributions to the team/product, or project involvement."
      ]
      "benefits": [
        "5 concise bullet points focusing on company culture, work-life balance, or unique perks."
      ]
    }
    
    Only return valid JSON. Do not add any explanations before or after.
    `;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant for HR job postings.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = chat.choices[0].message.content || "{}";

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response." },
      { status: 500 }
    );
  }
}
