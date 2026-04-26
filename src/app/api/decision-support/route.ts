import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const { patientName, diagnosis, medications = [], vitals = {}, weeks } = data;

    const systemPrompt = `You are a clinical decision support AI for an Indian rural hospital doctor. 
Analyze patient data and provide evidence-based WHO guidelines nudges, drug interaction warnings, and clinical alerts.
Output MUST be valid JSON only — no markdown, no backticks.`;

    const userPrompt = `Patient: ${patientName || 'Unknown'}, ${weeks ? `${weeks} weeks pregnant` : 'obstetric patient'}
Diagnosis: ${diagnosis || 'Unspecified'}
Current medications: ${medications.length > 0 ? medications.join(', ') : 'None recorded'}
Vitals: BP ${vitals.bp || 'N/A'}, HR ${vitals.hr || 'N/A'}, Temp ${vitals.temp || 'N/A'}

Provide clinical decision support with exactly this JSON structure:
{
  "drug_interactions": ["List any drug interaction warnings. If none, state 'No interactions detected'."],
  "who_guidelines": ["List 2-3 specific WHO maternal health guideline nudges relevant to this case"],
  "red_flag_alerts": ["List 1-2 critical clinical alerts the doctor must not miss, based on the vitals/diagnosis"],
  "recommended_tests": ["List 2-3 specific tests or investigations to order"],
  "dosage_check": "One sentence confirming or correcting any medication dosage concerns",
  "clinical_summary": "2-sentence clinical summary with key decision point for this patient"
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
  } catch (error) {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
