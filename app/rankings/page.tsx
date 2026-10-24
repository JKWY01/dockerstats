import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum, fullNum } from '@/lib/site'
import { topByPulls } from '@/lib/hub'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Most-Pulled Docker Images — Official Library Rankings',
  description: 'The most-pulled official Docker images, ranked by total Docker Hub pull count.',
  alternates: { canonical: '/rankings' },
}

export default function RankingsPage() {
  const top = topByPulls(100)
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Rankings' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">Rankings · Docker Hub</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Most-pulled official images</h1>
      <p className="mt-3 text-[15px] text-ink/65">Top 100 by lifetime pull count, refreshed daily.</p>

      <AdSlot slot="rankings-top" />

      <ol className="mt-6 divide-y divide-ink/8 text-[14px]">
        {top.map((m, i) => (
          <li key={m.name} className="py-2">
            <Link href={`/image/${m.name}`} className="flex items-baseline justify-between gap-3 hover:text-brand">
              <span className="font-mono font-medium">
                <span className="mr-2 font-sans text-ink/40">{i + 1}</span>
                {m.name}
              </span>
              <span className="shrink-0 text-ink/55">{fullNum(m.pulls)}</span>
            </Link>
          </li>
        ))}
      </ol>

      <AdSlot slot="rankings-bottom" />
    </div>
  )
}
