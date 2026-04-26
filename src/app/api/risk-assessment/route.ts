import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) {
      console.error('GROK_API_KEY is not set');
      // For testing without API key, return a mock response or 500
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

    const systemPrompt = "You are a maternal health risk assessment AI for rural India. You help ASHA workers identify high-risk pregnancies. Always respond in JSON format only without markdown blocks.";
    
    const userPrompt = `Analyze this pregnant patient's data and give risk assessment:
Patient: ${data.name}, Age: ${data.age}, Week: ${data.week}, Trimester: ${data.trimester}
BP: ${data.systolic}/${data.diastolic} mmHg, HR: ${data.hr} bpm, Temp: ${data.temp}°F
Blood Sugar: ${data.sugar || 'N/A'} mg/dL
Fetal movements (last hour): ${data.kicks}
Previous C-section: ${data.prevCSection ? 'Yes' : 'No'}, Previous miscarriage: ${data.prevMiscarriage ? 'Yes' : 'No'}
Distance to PHC: ${data.distance}, Road: ${data.road}, Weather: ${data.weather}
Symptoms: ${data.symptoms?.join(', ') || 'None'}
Bleeding: ${data.bleeding}, Dizziness: ${data.dizziness ? 'Yes' : 'No'}, Vomiting: ${data.vomiting ? 'Yes' : 'No'}, Swelling: ${data.swelling?.join(', ') || 'None'}
Anxiety: ${data.anxiety}/5, Stress: ${data.stress}/5, Sleep: ${data.sleep}

Respond ONLY with this JSON:
{
  "risk_level": "HIGH" | "MEDIUM" | "LOW",
  "risk_score": number (0-10),
  "primary_reasons": string[] (in Hindi, max 3 reasons),
  "immediate_action": string (in Hindi, what ASHA should do RIGHT NOW),
  "what_to_tell_family": string (in Hindi, simple language),
  "doctor_note": string (in English, clinical summary),
  "next_visit_days": number (when to visit next),
  "red_flags": string[] (warning signs to watch)
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.2,
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
    
    // Clean up any potential markdown code block wrappers
    content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedOut = JSON.parse(content);
      return NextResponse.json(parsedOut);
    } catch (e) {
      console.error("Failed to parse Grok JSON:", content);
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }

  } catch (error) {
    console.error("Risk Assessment API error:", error);
    return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
  }
}
