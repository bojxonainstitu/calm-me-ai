/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // three.js ekosistemasi ESM paketlari bilan muammosiz ishlashi uchun
  transpilePackages: ['three'],
  // Hakaton sahnasi uchun: lint/tip ogohlantirishlari build’ni toʻxtatmasin.
  // Toʻliq tekshiruv: `npm run lint` va `npm run typecheck`. Qatʼiy rejim: STRICT_BUILD=1 npm run build
  eslint: { ignoreDuringBuilds: process.env.STRICT_BUILD !== '1' },
  typescript: { ignoreBuildErrors: process.env.STRICT_BUILD !== '1' },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Mikrofon va kamera faqat shu sayt uchun (biometrika lokal qayta ishlanadi)
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self)' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
