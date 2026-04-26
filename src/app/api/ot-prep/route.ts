import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const { patientName, condition, etaMinutes, weeks, riskLevel } = data;

    const systemPrompt = `You are a hospital OT preparation AI for a rural Indian hospital. 
Generate a precise, actionable OT/ward preparation checklist based on the incoming patient details.
Output MUST be valid JSON only — no markdown, no backticks.`;

    const userPrompt = `Incoming patient: ${patientName || 'Unknown'}, ${weeks || '?'} weeks pregnant.
Condition: ${condition || 'High-risk obstetric emergency'}
ETA: ${etaMinutes || 15} minutes
Risk Level: ${riskLevel || 'HIGH'}

Generate an emergency prep checklist with exactly this JSON structure:
{
  "ot_checklist": ["List 4-5 specific OT preparation steps to complete before patient arrives"],
  "blood_prep": "Specific blood type/units to prepare and crossmatch instructions",
  "team_alert": ["List which specialists/staff to call right now — be specific with roles"],
  "bed_assignment": "Which specific ward/bed to assign and why",
  "drug_prep": ["List 3-4 specific drugs/dosages to prepare in advance"],
  "triage_priority": "P1/P2/P3 and one sentence justification",
  "receiving_note": "One sentence briefing for the receiving doctor — key clinical facts"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.15,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const result = await response.json();
    let content = result.choices[0].message.content;
    content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
