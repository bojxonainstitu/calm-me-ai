import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/brand/SiteHeader';
import { SiteFooter } from '@/components/brand/SiteFooter';

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-jakarta', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'CALM ME AI | Taktik De-eskalatsiya Simulyatori',
  description:
    'Bojxona, IIV va Milliy gvardiya xodimlari uchun AI asosidagi de-eskalatsiya, taktik muloqot va psixologik barqarorlik trenajyori.',
  applicationName: 'CALM ME AI',
};

export const viewport: Viewport = {
  themeColor: '#070B14',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={`dark ${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-steel focus:px-4 focus:py-2 focus:text-white">
          Asosiy mazmunga oʻtish
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
