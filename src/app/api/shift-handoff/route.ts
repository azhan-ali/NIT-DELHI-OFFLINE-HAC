import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const { patients = [], doctorName = 'Dr. Anjali M.', shiftDate = new Date().toLocaleDateString('en-IN') } = data;

    const systemPrompt = `You are a clinical AI assistant generating a professional Shift Handoff Brief for a Medical Officer in a rural Indian hospital. 
Be concise, clinically precise, and structured. Output MUST be valid JSON only — no markdown, no backticks.`;

    const patientSummary = patients.length > 0
      ? patients.map((p: any) => `- ${p.name} (${p.weeks || '?'}W, score: ${p.score || '?'}/10, ${p.isHighRisk ? 'HIGH RISK' : 'routine'})`).join('\n')
      : '- Pooja Sharma (34W, score: 9/10, HIGH RISK - Preeclampsia)\n- Meena Devi (28W, score: 5/10, Gestational Diabetes)\n- Sunita Kumari (36W, score: 3/10, Routine ANC)';

    const userPrompt = `Generate a shift handoff brief for ${doctorName} on ${shiftDate}.

Active patient list:
${patientSummary}

Generate a clinical shift handoff with exactly this JSON structure:
{
  "critical_alerts": ["List 1-2 most urgent patients needing immediate attention from incoming doctor"],
  "pending_tasks": ["List 2-3 specific tasks that must be completed by incoming doctor"],
  "stable_patients": ["List patients who are stable and need only routine monitoring"],
  "blood_bank_status": "One sentence about blood availability/pre-positioning needed",
  "incoming_doctor_note": "One personalized sentence from outgoing doctor to incoming doctor with the most critical handoff info",
  "shift_summary": "2-sentence overall summary of the shift and patient load"
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.2,
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
