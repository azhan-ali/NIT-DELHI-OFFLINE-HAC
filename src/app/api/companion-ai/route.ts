import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const { riskResult, patientName, patientWeeks } = data;

    const systemPrompt = `You are MaaSaheli AI Companion — a kind, supportive assistant for ASHA (Accredited Social Health Activist) workers in rural India.
Your job is to translate complex medical risk assessments into simple, actionable Hindi guidance that an ASHA worker can immediately use.
Always respond in SIMPLE HINDI (avoid complex medical jargon). Be warm, encouraging, and clear.
Output MUST be valid JSON only — no markdown, no backticks.`;

    const userPrompt = `An ASHA worker just completed a risk assessment for patient "${patientName}" (${patientWeeks || 'unknown'} weeks pregnant).

Risk Assessment Result:
- Risk Level: ${riskResult.risk_level}
- Risk Score: ${riskResult.risk_score}/10
- Primary Reasons: ${riskResult.primary_reasons?.join(', ')}
- Immediate Action: ${riskResult.immediate_action}
- What to tell family: ${riskResult.what_to_tell_family}
- Red Flags: ${riskResult.red_flags?.join(', ')}

Generate a Companion AI response in simple Hindi with exactly this JSON structure:
{
  "kyun_aayi_warning": "2-3 simple sentences in Hindi explaining WHY this warning came — use simple language an ASHA worker can understand and repeat to others",
  "family_ko_kya_bolein": "2-3 simple sentences in Hindi — what the ASHA worker should say to the patient's family right now, in a calm reassuring way",
  "agla_kadam": "3 clear bullet steps in Hindi — what the ASHA worker should do next, numbered and very specific",
  "himmat_ka_sandesh": "One short motivational sentence in Hindi for the ASHA worker herself, acknowledging her important work"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Grok API Error:', errText);
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Clean up markdown wrappers if any
    content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedOut = JSON.parse(content);
      return NextResponse.json(parsedOut);
    } catch (e) {
      console.error("Failed to parse Grok Companion JSON:", content);
      return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 500 });
    }

  } catch (error) {
    console.error("Companion AI API error:", error);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
