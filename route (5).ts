import { NextResponse } from 'next/server';
import type { AgencyId, CitizenPersona, ProvocationType, VideoAnalysis } from '@/lib/types';
import { analysisFromSample, buildScenarioFromAnalysis, heuristicAnalysis, makeTimeline } from '@/lib/engine/video';
import { videoSystemPrompt, videoUserPrompt } from '@/lib/engine/prompts';
import { completeJSON } from '@/lib/engine/llm';
import { clamp } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface Body {
  sampleId?: string;
  frames?: string[];
  frameTimes?: number[];
  note?: string;
  durationSec?: number;
  fileName?: string;
  facesBlurred?: number;
  platesBlurred?: number;
  privacyMethod?: VideoAnalysis['privacyMethod'];
}

interface LLMVideo {
  title?: string;
  summary?: string;
  triggerTimestampSec?: number;
  triggerDescription?: string;
  tactic?: string;
  quote?: string;
  provocation?: string;
  agencies?: string[];
  citizen?: Partial<CitizenPersona>;
  brief?: string;
  objective?: string;
  openingLine?: string;
  tactics?: string[];
  initialAggression?: number;
  legalRefIds?: string[];
}

const PROVOCATIONS: ProvocationType[] = ['refusal', 'filming', 'connections', 'crowd', 'emotional', 'insult'];

/**
 * POST /api/video-to-sim — «Video → Ssenariy».
 * Brauzer videodan 6 ta kadr ajratadi va yuz/raqamlarni LOKAL xiralashtiradi; serverga faqat
 * xiralashtirilgan kichik kadrlar keladi. AI kaliti boʻlmasa — evristik tahlil.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Notoʻgʻri JSON' }, { status: 400 });
  }

  if (body.sampleId) {
    const r = analysisFromSample(body.sampleId);
    if (r) return NextResponse.json(r);
  }

  const frames = (body.frames ?? []).filter((f) => typeof f === 'string' && f.startsWith('data:image/')).slice(0, 8);
  const fallback = heuristicAnalysis(body);
  if (!frames.length && !body.note) return NextResponse.json(fallback);

  const duration = Math.max(5, Number(body.durationSec) || 45);
  const llm = await completeJSON<LLMVideo>(
    videoSystemPrompt(),
    videoUserPrompt(body.note ?? '', duration, body.fileName ?? '', body.frameTimes ?? []),
    { images: frames, temperature: 0.4, timeoutMs: 25_000 },
  );
  if (!llm) return NextResponse.json(fallback);

  const d = llm.data;
  const provocation = PROVOCATIONS.includes(d.provocation as ProvocationType) ? (d.provocation as ProvocationType) : fallback.analysis.provocation;
  const trigger = clamp(Number(d.triggerTimestampSec) || fallback.analysis.triggerTimestampSec, 0, duration);
  const analysis: VideoAnalysis = {
    title: d.title?.toString().slice(0, 90) || fallback.analysis.title,
    summary: d.summary?.toString().slice(0, 500) || fallback.analysis.summary,
    durationSec: duration,
    triggerTimestampSec: Math.round(trigger),
    triggerDescription: d.triggerDescription?.toString().slice(0, 300) || fallback.analysis.triggerDescription,
    tactic: d.tactic?.toString().slice(0, 120) || fallback.analysis.tactic,
    quote: d.quote?.toString().slice(0, 160),
    provocation,
    facesBlurred: Number(body.facesBlurred) || 0,
    platesBlurred: Number(body.platesBlurred) || 0,
    privacyMethod: body.privacyMethod ?? 'heuristic',
    timeline: makeTimeline(duration, trigger),
  };
  const scenario = buildScenarioFromAnalysis(analysis, {
    title: d.title ? `Videodan: ${d.title}` : undefined,
    brief: d.brief,
    objective: d.objective,
    openingLine: d.openingLine,
    tactics: Array.isArray(d.tactics) ? d.tactics.map(String) : undefined,
    citizen: d.citizen,
    agencies: Array.isArray(d.agencies) ? (d.agencies as AgencyId[]) : undefined,
    legalRefIds: Array.isArray(d.legalRefIds) ? d.legalRefIds.map(String) : undefined,
    initialAggression: Number(d.initialAggression) || undefined,
  });
  return NextResponse.json({ analysis, scenario, source: 'llm' });
}
