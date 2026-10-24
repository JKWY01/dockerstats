import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { jsonLdScript } from '@/lib/jsonld'
import { BASE, SITE_NAME, bigNum } from '@/lib/site'
import { meta, topByPulls } from '@/lib/hub'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Docker Official Image Stats — Pulls, Tags, Update Times',
  description: 'Every official Docker library image with total pulls, stars, and the freshest tags with build times — straight from the Docker Hub API, refreshed daily.',
  alternates: { canonical: '/' },
}

export default function Home() {
  const m = meta()
  const top = topByPulls(20)
  const siteLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${BASE}/`,
    description: 'Docker official image stats: pulls, tags, update times.',
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteLd }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {m.count} official images · daily refresh
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Docker official image stats
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        The entire <span className="font-mono">library</span> namespace — pulls, stars, and the{' '}
        {m.top_tags} most recent tags per image with push times — straight from the Docker Hub API.
        One page per image.
      </p>

      <AdSlot slot="home-top" />

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Top 20 by pulls</h2>
        <ul className="mt-4 divide-y divide-ink/8 text-[14px]">
          {top.map((img, i) => (
            <li key={img.name} className="py-2">
              <Link href={`/image/${img.name}`} className="flex items-baseline justify-between gap-3 hover:text-brand">
                <span className="font-mono font-medium">
                  <span className="mr-2 font-sans text-ink/40">{i + 1}</span>
                  {img.name}
                </span>
                <span className="shrink-0 text-ink/55">{bigNum(img.pulls)} pulls</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/images"
          className="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-ink/85"
        >
          Browse all {m.count} images →
        </Link>
      </section>

      <AdSlot slot="home-bottom" />
    </div>
  )
}
