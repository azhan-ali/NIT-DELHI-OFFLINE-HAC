import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) {
      console.error('GROK_API_KEY is not set');
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const { transcript } = data;

    const systemPrompt = "You are a specialized medical AI assistant. Your job is to take raw, messy dictations from a doctor and rigidly format them into a highly professional SOAP note (Subjective, Objective, Assessment, Plan). Output MUST be valid JSON only, without any markdown formatting wrappers or backticks.";
    
    const userPrompt = `Convert the following raw audio transcript into a structured SOAP note:
"${transcript}"

Format your response exactly like this JSON structure:
{
  "subjective": "Summarize the patient's symptoms and what they said.",
  "objective": "Summarize measurable facts, vitals, or clinical observations mentioned.",
  "assessment": "What is the diagnosis or primary issue?",
  "plan": "What are the next steps, medications, or tests ordered?"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.1, // Very low temp for clinical structuring
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
    
    // Safety clean up of markdown wrappers if Grok adds them
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsedOut = JSON.parse(content);
      return NextResponse.json(parsedOut);
    } catch (e) {
      console.error("Failed to parse Grok JSON:", content);
      return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 500 });
    }

  } catch (error) {
    console.error("SOAP Note API error:", error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
