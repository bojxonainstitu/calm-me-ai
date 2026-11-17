import { NextResponse } from 'next/server';
import { activeModel, activeProvider } from '@/lib/engine/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/health — sarlavhadagi «AI Tizim: Faol» nishoni uchun holat */
export async function GET() {
  const provider = activeProvider();
  return NextResponse.json({
    ok: true,
    provider,
    model: activeModel(provider),
    demoForced: (process.env.DEMO_MODE ?? '').toLowerCase() === 'on',
  });
}
