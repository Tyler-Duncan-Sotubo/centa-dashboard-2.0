import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: Request) {
  const {
    employeeName,
    role,
    questions,
  }: {
    employeeName: string;
    role: string;
    questions: Record<
      string,
      {
        questionId: string;
        question: string;
        type: "rating" | "yes_no" | "text";
        response: string;
        competency: string;
      }[]
    >;
  } = await req.json();

  const flatList = Object.entries(questions)
    .map(([competency, items]) => {
      const lines = [`Competency: ${competency}`];
      for (const q of items) {
        lines.push(`- Q: ${q.question}\n  A: ${q.response}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const prompt = `
You are an HR assistant helping write professional employee performance reviews.

Employee Name: ${employeeName}
Role: ${role}

Here is the employee's evaluation data grouped by competency:

${flatList}

Based on this information, generate the following:

1. Final Summary — A concise paragraph (3–4 sentences) summarizing the employee’s overall performance. Use a professional, balanced tone. Mention general strengths, consistency, and notable areas observed across competencies.
2. Strengths — A Numbered List 4-5 specific, evidence-based strengths. Use bullet points. Make sure to include specific examples from the evaluation data.
3. Areas for Improvement — A Numbered List 4-5 development areas. Use bullet points. Make sure to include specific examples from the evaluation data.
4. Full Assessment Paragraph — A formal narrative combining the above. Let a professional tone shine through. This should be at least 2 paragraphs separated with spacing that encapsulates the entire assessment.
5. Suggested Final Score — A number between 0 and 100.
6. Promotion Recommendation — One of: promote, hold, or exit.

### Formatting Instructions:
- Return ALL content as valid HTML (not markdown).
- Use <p> for paragraphs, <ul><li>...</li></ul> for lists.
- Clearly label each section in the HTML with a <strong> tag.

Example:
<p><strong>Final Summary:</strong> ...</p>
<p><strong>Strengths:</strong></p>
<ul><li>...</li></ul>
`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert HR assistant writing performance reviews.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = chat.choices[0].message.content || "";

  const extractParagraph = (label: string): string => {
    const regex = new RegExp(
      `<p><strong>${label}:<\\/strong>\\s*([\\s\\S]*?)<\\/p>`,
      "i"
    );
    const match = content.match(regex);
    return match ? `<p><strong>${label}:</strong> ${match[1].trim()}</p>` : "";
  };

  const extractList = (label: string): string => {
    const regex = new RegExp(
      `<p><strong>${label}:<\\/strong><\\/p>\\s*<ul>([\\s\\S]*?)<\\/ul>`,
      "i"
    );
    const match = content.match(regex);
    return match ? `<ul>${match[1].trim()}</ul>` : "";
  };

  const extractScore = (): number | null => {
    const match = content.match(
      /<p><strong>Suggested Final Score:<\/strong>\s*(\d{1,3})<\/p>/i
    );
    return match ? parseInt(match[1], 10) : null;
  };

  const extractRecommendation = (): string | null => {
    const match = content.match(
      /<p><strong>Promotion Recommendation:<\/strong>\s*(promote|hold|exit)<\/p>/i
    );
    return match ? match[1].toLowerCase() : null;
  };

  return NextResponse.json({
    summary: extractParagraph("Final Summary"),
    strengths: extractList("Strengths"),
    areasForImprovement: extractList("Areas for Improvement"),
    fullAssessment: extractParagraph("Full Assessment Paragraph"),
    suggestedFinalScore: extractScore(),
    suggestedPromotionRecommendation: extractRecommendation(),
    raw: content, // for preview/debugging
  });
}
