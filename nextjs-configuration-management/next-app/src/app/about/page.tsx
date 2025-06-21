import { getConfig } from '@/lib/config';
import Link from 'next/link';

export default async function About() {
  const config = await getConfig();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>About Page</h1>
        <p>{config.pro ? 'PRO' : 'NOT PRO'}</p>
        <Link href="/">Home</Link>
      </main>
    </div>
  );
}
