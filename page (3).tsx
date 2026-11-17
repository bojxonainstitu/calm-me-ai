import type { Metadata } from 'next';
import { VideoToSim } from '@/components/video/VideoToSim';

export const metadata: Metadata = { title: 'Video → Ssenariy | CALM ME AI' };

export default function VideoToSimPage() {
  return <VideoToSim />;
}
