import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const API_KEY = process.env.GROK_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const { totalAlerts, highRiskCount, districtName, ashaCount, phcCount } = data;

    const systemPrompt = `You are a district health budget optimization AI for India's NHM (National Health Mission).
Based on current field data, generate actionable budget allocation recommendations, ASHA deployment analysis, and ROI reports.
Output MUST be valid JSON only — no markdown, no backticks.`;

    const userPrompt = `District: ${districtName || 'Central District 4'}
Total maternal risk alerts this month: ${totalAlerts || 12}
High-risk cases: ${highRiskCount || 5}
Active ASHA workers: ${ashaCount || 342}
PHC facilities: ${phcCount || 8}

Generate budget optimization with exactly this JSON structure:
{
  "where_to_deploy_asha": [
    { "cluster": "village/area name", "priority": "HIGH/MEDIUM", "reason": "why this cluster needs more ASHAs", "asha_needed": "number" },
    { "cluster": "another area", "priority": "HIGH/MEDIUM", "reason": "reason", "asha_needed": "number" }
  ],
  "roi_per_phc": [
    { "phc": "PHC name", "cases_handled": "number", "cost_per_case": "₹amount", "efficiency": "HIGH/MEDIUM/LOW", "recommendation": "one action" },
    { "phc": "PHC name", "cases_handled": "number", "cost_per_case": "₹amount", "efficiency": "HIGH/MEDIUM/LOW", "recommendation": "one action" }
  ],
  "budget_nudges": [
    { "action": "specific budget action", "amount": "₹amount", "impact": "expected outcome", "urgency": "THIS WEEK/THIS MONTH/NEXT QUARTER" },
    { "action": "another action", "amount": "₹amount", "impact": "impact", "urgency": "urgency level" },
    { "action": "third action", "amount": "₹amount", "impact": "impact", "urgency": "urgency" }
  ],
  "scenario_simulation": {
    "current_mmr": "estimated current maternal mortality rate per 100k",
    "with_ai_platform": "projected MMR with MaaSaheli deployed district-wide",
    "lives_saved_annually": "estimated lives saved per year",
    "investment_needed": "₹total investment needed",
    "roi_months": "months to achieve ROI"
  }
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'grok-3-mini', temperature: 0.2,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });

    const result = await response.json();
    let content = result.choices[0].message.content;
    content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    try { return NextResponse.json(JSON.parse(content)); }
    catch { return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 500 }); }
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
