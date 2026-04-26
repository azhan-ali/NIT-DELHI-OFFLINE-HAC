import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) {
      console.error('GROK_API_KEY is not set');
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const { eventText } = data;

    const systemPrompt = "You are an AI Death Audit specialist for the National Health Mission (NHM) in India. Your goal is to analyze reports of maternal or infant fatalities and perform a strict 'Counterfactual Analysis'. You must determine what systemic failures occurred and what actions would have prevented it. Output MUST be valid JSON only, without any markdown formatting wrappers or backticks.";
    
    const userPrompt = `Analyze this maternal death incident:
"${eventText}"

Perform a counterfactual analysis. Format your response exactly like this JSON structure:
{
  "systemic_failures": ["Identify 2-3 specific system, logistic, or medical delays"],
  "counterfactual": "What specific action, if taken X hours/days earlier, could have prevented this?",
  "policy_nudge": "What budget or policy change should the District Officer make based on this?",
  "preventable_score": "Percentage (0-100%) indicating how preventable this death was"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      console.error('Grok API Error:', await response.text());
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsedOut = JSON.parse(content);
      return NextResponse.json(parsedOut);
    } catch (e) {
      console.error("Failed to parse Grok JSON:", content);
      return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 500 });
    }

  } catch (error) {
    console.error("Death Audit API error:", error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
