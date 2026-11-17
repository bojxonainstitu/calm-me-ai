'use client';

import type {
  CitizenReply,
  EvaluateRequest,
  Evaluation,
  SimulateRequest,
  VideoToSimResponse,
} from './types';
import { evaluateUtterance } from './engine/evaluator';
import { demoCitizenReply } from './engine/citizen';
import { analysisFromSample, heuristicAnalysis } from './engine/video';
import { fetchWithTimeout } from './utils';
import { getDemoMode } from './storage';

/**
 * Mijoz API qatlami: har bir chaqiruv avval serverga (AI) boradi, muvaffaqiyatsiz
 * boʻlsa yoki «Demo rejim» yoqilgan boʻlsa — aynan shu mantiq brauzerda bajariladi.
 * Shu tufayli sahna namoyishi Wi-Fi uzilsa ham toʻxtamaydi.
 */

const TIMEOUT = 11_000;

async function postJSON<T>(url: string, body: unknown, timeout = TIMEOUT): Promise<T> {
  const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, timeout);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

export async function evaluateTurn(req: EvaluateRequest, previousOfficerTexts: string[]): Promise<Evaluation> {
  if (getDemoMode() !== 'on') {
    try {
      return await postJSON<Evaluation>('/api/evaluate', { ...req, previousOfficerTexts });
    } catch (e) {
      console.info('[CALM ME AI] /api/evaluate mavjud emas — lokal baholovchi ishlatildi', e);
    }
  }
  return evaluateUtterance(req, previousOfficerTexts);
}

export async function simulateTurn(req: SimulateRequest): Promise<CitizenReply> {
  if (getDemoMode() !== 'on') {
    try {
      return await postJSON<CitizenReply>('/api/simulate', req);
    } catch (e) {
      console.info('[CALM ME AI] /api/simulate mavjud emas — lokal AI Fuqaro ishlatildi', e);
    }
  }
  return demoCitizenReply(req);
}

export interface VideoRequest {
  sampleId?: string;
  frames?: string[];
  frameTimes?: number[];
  note?: string;
  durationSec?: number;
  fileName?: string;
  facesBlurred?: number;
  platesBlurred?: number;
  privacyMethod?: 'face-detector' | 'heuristic' | 'synthetic';
}

export async function videoToSim(req: VideoRequest): Promise<VideoToSimResponse> {
  if (getDemoMode() !== 'on') {
    try {
      return await postJSON<VideoToSimResponse>('/api/video-to-sim', req, 25_000);
    } catch (e) {
      console.info('[CALM ME AI] /api/video-to-sim mavjud emas — lokal tahlil ishlatildi', e);
    }
  }
  if (req.sampleId) {
    const r = analysisFromSample(req.sampleId);
    if (r) return r;
  }
  return heuristicAnalysis(req);
}

export interface HealthInfo {
  ok: boolean;
  provider: 'openai' | 'gemini' | 'none';
  model: string;
  demoForced: boolean;
}

export async function fetchHealth(): Promise<HealthInfo | null> {
  try {
    const res = await fetchWithTimeout('/api/health', { cache: 'no-store' }, 4000);
    if (!res.ok) return null;
    return (await res.json()) as HealthInfo;
  } catch {
    return null;
  }
}
