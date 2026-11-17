import { NextResponse } from 'next/server';
import type { CitizenReply, SimulateRequest } from '@/lib/types';
import { demoCitizenReply, RESOLVE_THRESHOLD } from '@/lib/engine/citizen';
import { citizenSystemPrompt, citizenUserPrompt } from '@/lib/engine/prompts';
import { completeJSON } from '@/lib/engine/llm';
import { DEFAULT_PROFILE } from '@/lib/agencies';
import { getScenario } from '@/lib/scenarios';
import { clamp, emotionFor } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LLMCitizen {
  reply?: string;
  aggression?: number;
  emotion?: string;
  tactic?: string;
}

/**
 * POST /api/simulate — AI Fuqaro javobi.
 * Agressiya «langari» baholovchidan keladi; LLM uni faqat ±8 oraligʻida oʻzgartira oladi —
 * shu bilan sahnadagi koʻrsatkichlar mantiqiy va izchil qoladi.
 */
export async function POST(req: Request) {
  let body: SimulateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Notoʻgʻri JSON' }, { status: 400 });
  }
  const scenario = body.scenario?.demoScript ? body.scenario : getScenario(String((body.scenario as { id?: string } | undefined)?.id ?? ''));
  if (!scenario || !body.evaluation) {
    return NextResponse.json({ error: 'scenario va evaluation majburiy' }, { status: 400 });
  }
  const request: SimulateRequest = {
    scenario,
    profile: { ...DEFAULT_PROFILE, ...(body.profile ?? {}) },
    history: Array.isArray(body.history) ? body.history.slice(-16) : [],
    aggression: clamp(Number(body.aggression) || scenario.initialAggression),
    evaluation: body.evaluation,
    turnIndex: Number.isFinite(body.turnIndex) ? body.turnIndex : 0,
  };

  const demo = demoCitizenReply(request);
  // Yakuniy holatlar (korrupsiya, portlash nuqtasi, yechim) — ssenariy matni barqaror boʻlishi uchun demo javobi
  const terminal =
    request.evaluation.flags.some((f) => f.code === 'corruption') ||
    request.aggression >= 97 ||
    (request.aggression <= RESOLVE_THRESHOLD && request.turnIndex >= 2);
  if (terminal) return NextResponse.json(demo);

  const llm = await completeJSON<LLMCitizen>(
    citizenSystemPrompt(scenario, request.profile),
    citizenUserPrompt(request.history, request.aggression, request.evaluation),
    { temperature: 0.85 },
  );
  const text = llm?.data.reply?.toString().trim();
  if (!llm || !text) return NextResponse.json(demo);

  const raw = Number(llm.data.aggression);
  const aggression = Math.round(clamp(Number.isFinite(raw) ? raw : request.aggression, request.aggression - 8, request.aggression + 8));
  const reply: CitizenReply = {
    text: text.slice(0, 500),
    aggression: clamp(aggression),
    emotion: llm.data.emotion?.toString().slice(0, 40) || emotionFor(aggression),
    tactic: llm.data.tactic?.toString().slice(0, 80),
    source: 'llm',
  };
  return NextResponse.json(reply);
}
