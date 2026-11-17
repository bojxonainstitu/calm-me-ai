import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-28 text-center">
      <p className="hud-label">404</p>
      <h1 className="mt-2 text-3xl font-bold">Sahifa topilmadi</h1>
      <p className="mt-2 text-slate-400">Soʻralgan manzil mavjud emas yoki koʻchirilgan.</p>
      <Link href="/" className="mt-6 inline-block text-blue-300 underline">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
