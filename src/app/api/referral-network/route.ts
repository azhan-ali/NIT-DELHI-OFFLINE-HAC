import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const { patientName, condition, weeks, riskLevel, currentHospital, bedType } = data;

    const systemPrompt = `You are a hospital referral network AI for India's NHM (National Health Mission). 
Based on patient condition and bed requirements, identify the best nearby facilities in rural India.
Output MUST be valid JSON only — no markdown, no backticks.`;

    const userPrompt = `Patient transfer request:
Patient: ${patientName || 'Unknown'}, ${weeks || '?'} weeks pregnant
Condition: ${condition || 'High-risk obstetric case'}
Risk Level: ${riskLevel || 'HIGH'}
Current facility: ${currentHospital || 'PHC Sub-center'}
Required bed type: ${bedType || 'NICU/OT'}

Generate a referral network response with exactly this JSON structure:
{
  "nearest_facilities": [
    {
      "name": "Facility name — realistic Indian district hospital name",
      "distance_km": "distance in km",
      "eta_minutes": "estimated ETA by ambulance",
      "available_beds": "number available",
      "specialty": "what specialized care they can provide",
      "contact": "realistic phone number format",
      "recommendation": "WHY this facility is best for this patient"
    },
    {
      "name": "Second option facility",
      "distance_km": "distance",
      "eta_minutes": "ETA",
      "available_beds": "number",
      "specialty": "specialty",
      "contact": "contact",
      "recommendation": "why this is second choice"
    }
  ],
  "transfer_packet": {
    "clinical_summary": "2-sentence clinical summary for receiving doctor",
    "active_medications": ["List 2-3 current medications patient is on"],
    "interventions_done": ["List 2-3 interventions already performed"],
    "receiving_instructions": "What the receiving facility must prepare before patient arrives"
  },
  "recommended_facility_index": 0,
  "transfer_urgency": "IMMEDIATE/URGENT/ROUTINE"
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
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
