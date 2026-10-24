import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum } from '@/lib/site'
import { allImages, groupByLetter } from '@/lib/hub'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'All Docker Official Images — Complete List by Pulls',
  description: 'Every image in the Docker library namespace with pull counts and a recent-tags page for each.',
  alternates: { canonical: '/images' },
}

export default function ImagesPage() {
  const groups = groupByLetter()
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Images' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">Directory</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        All {allImages().length} official images
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">Grouped by first letter, sorted by pulls within each group.</p>

      <AdSlot slot="images-top" />

      {groups.map((g) => (
        <section key={g.letter} className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{g.letter}</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2">
            {g.images.map((m) => (
              <li key={m.name} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                <Link href={`/image/${m.name}`} className="font-mono font-medium hover:text-brand">
                  {m.name}
                </Link>
                <span className="shrink-0 text-[12.5px] text-ink/50">{bigNum(m.pulls)} pulls</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
