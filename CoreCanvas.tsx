'use client';

import dynamic from 'next/dynamic';
import type { NeuralCoreProps } from './NeuralCore';

/** NeuralCoreʼni faqat brauzerda yuklaydi (SSRʼsiz) */
const LazyCore = dynamic(() => import('./NeuralCore').then((m) => m.NeuralCore), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-pulse rounded-full bg-cobalt-500/20" />
    </div>
  ),
});

export function CoreCanvas(props: NeuralCoreProps) {
  return <LazyCore {...props} />;
}
