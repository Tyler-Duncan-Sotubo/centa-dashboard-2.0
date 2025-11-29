// app/api/generate-offer-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/* ---- 1. Allowed Handlebars variables for offer letters ---- */
const VARIABLES = [
  "companyLogoUrl",
  "companyName",
  "companyAddress",
  "companyEmail",
  "companyPhone",
  "todayDate",
  "candidateFirstName",
  "candidateFullName",
  "jobTitle",
  "salaryNumeric",
  "salaryWords",
  "startDate",
  "workLocation",
  "teamName",
  "managerName",
  "managerTitle",
  "offerExpiryDate",
  "hrName",
  "hrTitle",
  "salary.basic",
  "salary.hra",
  "salary.allowances",
  "salary.pension",
  "salary.total",
  "payDay",
  "paymentMethod",
  "probationPeriod",
  "revisionAfter",
  "insuranceCoverage",
  "sig_cand",
  "date_cand",
  "sig_emp",
  "date_emp",
];

/* ---- 2. Create OpenAI client ---- */
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/* ---- 3.  POST handler ---- */
export async function POST(req: NextRequest) {
  try {
    const { style = "professional" } = await req.json();

    /* Build prompt */
    const varList = VARIABLES.map((v) => `• {{${v}}}`).join("\n");
    const prompt = `
You are an HR copywriter. Produce an HTML offer-letter template in the "${style}" style.

Requirements:
1. Use ONLY the Handlebars variables listed below (do not invent new ones).
2. Wrap text in <p>, <table>, etc. so that it renders nicely in email / PDF.
3. Include Candidate and Employer signature anchors {{sig_cand}} etc.
4. Use British spelling, formal tone.
5. Ensure the template is suitable for a professional offer letter.
6. Use Nigerian names and addresses as examples.

Allowed variables:
${varList}
`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You output raw HTML for HR documents. Never add markdown backticks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const html = chat.choices[0].message.content?.trim() || "";

    return NextResponse.json({ content: html });
  } catch (err) {
    console.error("Offer-template generation failed:", err);
    return NextResponse.json(
      { error: "Template generation failed" },
      { status: 500 }
    );
  }
}
