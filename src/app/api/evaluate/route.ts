import { NextResponse } from 'next/server';
import type { EvaluateRequest } from '@/lib/types';
import { evaluateUtterance, mergeEvaluations, type LLMEvaluation } from '@/lib/engine/evaluator';
import { evaluatorSystemPrompt, evaluatorUserPrompt } from '@/lib/engine/prompts';
import { completeJSON } from '@/lib/engine/llm';
import { DEFAULT_PROFILE } from '@/lib/agencies';
import { getScenario } from '@/lib/scenarios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/evaluate — Evaluator Agent.
 * Qoidaviy baholovchi har doim ishlaydi; AI kaliti mavjud boʻlsa LLM bahosi bilan
 * birlashtiriladi (gibrid). Kritik belgilar (korrupsiya, haqorat, tahdid) LLM’dan qatʼi nazar saqlanadi.
 */
export async function POST(req: Request) {
  let body: EvaluateRequest & { previousOfficerTexts?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Notoʻgʻri JSON' }, { status: 400 });
  }
  const scenario = body.scenario?.demoScript ? body.scenario : getScenario(String((body.scenario as { id?: string } | undefined)?.id ?? ''));
  if (!scenario || typeof body.utterance !== 'string' || !body.utterance.trim()) {
    return NextResponse.json({ error: 'scenario va utterance majburiy' }, { status: 400 });
  }
  const request: EvaluateRequest = {
    scenario,
    profile: { ...DEFAULT_PROFILE, ...(body.profile ?? {}) },
    utterance: body.utterance.slice(0, 1200),
    history: Array.isArray(body.history) ? body.history.slice(-16) : [],
    aggression: Number.isFinite(body.aggression) ? body.aggression : scenario.initialAggression,
    turnIndex: Number.isFinite(body.turnIndex) ? body.turnIndex : 0,
    micPeak: typeof body.micPeak === 'number' ? body.micPeak : undefined,
  };
  const prev =
    body.previousOfficerTexts ??
    request.history.filter((h) => h.speaker === 'officer').map((h) => h.text).slice(0, -1);

  const rules = evaluateUtterance(request, prev);
  const llm = await completeJSON<LLMEvaluation>(
    evaluatorSystemPrompt(scenario, request.profile),
    evaluatorUserPrompt(request.history, request.utterance, request.aggression, request.turnIndex),
    { temperature: 0.2 },
  );
  if (!llm) return NextResponse.json(rules);
  return NextResponse.json(mergeEvaluations(rules, llm.data, request.utterance, scenario));
}
