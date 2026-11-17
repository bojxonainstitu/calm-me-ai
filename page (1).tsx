import type { Metadata } from 'next';
import { SimulationArena } from '@/components/sim/SimulationArena';
import { getScenario } from '@/lib/scenarios';

export function generateMetadata({ params }: { params: { scenarioId: string } }): Metadata {
  const s = getScenario(decodeURIComponent(params.scenarioId));
  return { title: `${s?.shortTitle ?? 'Simulyatsiya'} | CALM ME AI` };
}

export default function SimulatePage({ params }: { params: { scenarioId: string } }) {
  return <SimulationArena scenarioId={params.scenarioId} />;
}
