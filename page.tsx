import type { Metadata } from 'next';
import { CommandCenter } from '@/components/admin/CommandCenter';

export const metadata: Metadata = { title: 'Qoʻmondonlik markazi | CALM ME AI' };

export default function AdminPage() {
  return <CommandCenter />;
}
