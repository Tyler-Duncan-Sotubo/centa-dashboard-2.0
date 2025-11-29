/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const {
    employeeName,
    role = "",
    levels,
  }: {
    employeeName: string;
    role: string;
    levels: Array<{
      competencyName: string;
      expectedLevelName: string;
      employeeLevelName: string | null;
      managerLevelName: string | null;
      notes?: string;
    }>;
  } = await req.json();

  // Build description of competency levels
  const levelDescriptions = levels
    .map((l) => {
      return `Competency: ${l.competencyName}
- Expected: ${l.expectedLevelName}
- Employee: ${l.employeeLevelName || "N/A"}
- Manager: ${l.managerLevelName || "N/A"}${
        l.notes ? `\n- Notes: ${l.notes}` : ""
      }`;
    })
    .join("\n\n");

  const prompt = `
You are an expert HR assistant helping write professional employee evaluations.

Here are competency evaluations for an employee:

Employee Name: ${employeeName}
Role: ${role}

${levelDescriptions}

Please analyze the above data and return the following as a valid JSON object only:

{
  "finalSummary": "<3-paragraph HTML summary>",
  "strengths": ["..."],
  "areasForImprovement": ["..."],
  "finalNote": "<two-paragraph HTML>",
  "suggestedFinalScore": <0–100>,
  "promotionRecommendation": "promote" | "hold" | "exit"
}

### Output Instructions:
- Return ONLY the JSON. No extra text, explanations, or markdown.
- Ensure all string values use proper HTML tags like <p>, <ul>, <li>.
`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert HR assistant writing competency-based performance reviews.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = chat.choices[0].message.content ?? "";

  // Safely parse the AI's response as JSON
  let parsed;
  try {
    parsed = JSON.parse(content);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("Invalid JSON from OpenAI:", content);
    return NextResponse.json(
      { error: "Invalid JSON response from AI", raw: content },
      { status: 500 }
    );
  }

  // Return structured data
  return NextResponse.json({
    suggestedFinalScore: parsed.suggestedFinalScore,
    suggestedPromotionRecommendation: parsed.promotionRecommendation,
    finalNote: parsed.finalNote,
    finalSummary: parsed.finalSummary,
    strengths: parsed.strengths,
    areasForImprovement: parsed.areasForImprovement,
    raw: content, // Optional raw HTML content
  });
}
