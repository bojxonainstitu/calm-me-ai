import 'server-only';

/**
 * LLM provayder adapteri (OpenAI / Gemini). SDK’siz, toʻgʻridan-toʻgʻri REST — kamroq bogʻliqlik.
 * Har bir chaqiruv taymaut bilan cheklangan: sekin tarmoqda null qaytaradi va
 * chaqiruvchi tomon avtomatik ravishda Demo dvigatelga oʻtadi.
 */

export type Provider = 'openai' | 'gemini' | 'none';

export function activeProvider(): Provider {
  if ((process.env.DEMO_MODE ?? '').toLowerCase() === 'on') return 'none';
  const pref = (process.env.AI_PROVIDER ?? 'auto').toLowerCase();
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  if (pref === 'openai') return hasOpenAI ? 'openai' : 'none';
  if (pref === 'gemini') return hasGemini ? 'gemini' : 'none';
  if (hasOpenAI) return 'openai';
  if (hasGemini) return 'gemini';
  return 'none';
}

export function activeModel(provider = activeProvider()) {
  if (provider === 'openai') return process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  if (provider === 'gemini') return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return 'rules-engine';
}

interface CompleteOptions {
  /** data:image/jpeg;base64,... koʻrinishidagi rasmlar */
  images?: string[];
  temperature?: number;
  timeoutMs?: number;
}

function parseJSON<T>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function withTimeout(url: string, init: RequestInit, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: 'no-store' });
  } finally {
    clearTimeout(t);
  }
}

async function callOpenAI(system: string, user: string, o: CompleteOptions) {
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const content = o.images?.length
    ? [{ type: 'text', text: user }, ...o.images.map((url) => ({ type: 'image_url', image_url: { url, detail: 'low' } }))]
    : user;
  const res = await withTimeout(
    `${base}/chat/completions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: activeModel('openai'),
        temperature: o.temperature ?? 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content },
        ],
      }),
    },
    o.timeoutMs!,
  );
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? '');
}

async function callGemini(system: string, user: string, o: CompleteOptions) {
  const model = activeModel('gemini');
  const parts: Record<string, unknown>[] = [{ text: user }];
  for (const img of o.images ?? []) {
    const m = img.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
  }
  const res = await withTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(process.env.GEMINI_API_KEY) },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: o.temperature ?? 0.7, responseMimeType: 'application/json' },
      }),
    },
    o.timeoutMs!,
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const partsOut: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  return partsOut.map((p) => p.text ?? '').join('');
}

export async function completeJSON<T>(system: string, user: string, options: CompleteOptions = {}): Promise<{ data: T; provider: Provider } | null> {
  const provider = activeProvider();
  if (provider === 'none') return null;
  const o: CompleteOptions = { ...options, timeoutMs: options.timeoutMs ?? Number(process.env.AI_TIMEOUT_MS || 8000) };
  try {
    const text = provider === 'openai' ? await callOpenAI(system, user, o) : await callGemini(system, user, o);
    const data = parseJSON<T>(text);
    return data ? { data, provider } : null;
  } catch (err) {
    console.warn('[CALM ME AI] LLM chaqiruvi muvaffaqiyatsiz, demo dvigatelga oʻtilmoqda:', (err as Error).message);
    return null;
  }
}
