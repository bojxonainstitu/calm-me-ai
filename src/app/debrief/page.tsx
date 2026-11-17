import type { Metadata } from 'next';
import { DebriefView } from '@/components/debrief/DebriefView';

export const metadata: Metadata = { title: 'AI Ustoz — tahlil | CALM ME AI' };

export default function DebriefPage({ searchParams }: { searchParams: { session?: string } }) {
  return <DebriefView sessionId={searchParams.session} />;
}
