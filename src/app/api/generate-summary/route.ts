import { NextResponse } from "next/server";

interface Recommendation {
  title: string;
  description: string;
  estimatedSavings: number;
}

export async function POST(req: Request) {
  try {
    const { companyName, totalCurrentSpend, totalEstimatedSavings, efficiencyScore, recommendations } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 400 });
    }

    const recText = (recommendations as Recommendation[]).map((r) => `- ${r.title}: ${r.description} (Savings: $${r.estimatedSavings}/mo)`).join("\n");

    const prompt = `You are a professional B2B SaaS finance analyst reviewing the AI tool spend audit for a company called "${companyName}".
Their current declared AI spend is $${totalCurrentSpend}/mo.
Our audit engine identified a potential savings of $${totalEstimatedSavings}/mo (representing a $${totalEstimatedSavings * 12}/yr reduction), placing their budget efficiency score at ${efficiencyScore} out of 100.
We generated the following optimization recommendations:
${recText}

Write a concise, professional, personalized summary paragraph (around 100 words) summarizing these results. Focus on actionable insights, tool redundancies, and right-sizing plans. Keep the tone financial, direct, and constructive. Do not include markdown headers or list bullet points. Speak directly to the company leadership.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 250,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API Error:", errText);
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }

    const data = await response.json() as { content?: { text?: string }[] };
    const summary = data.content?.[0]?.text || "";
    return NextResponse.json({ summary });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate Summary Exception:", error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
