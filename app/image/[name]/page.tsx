import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { jsonLdScript, breadcrumbLd } from '@/lib/jsonld'
import { BASE, bigNum, fullNum } from '@/lib/site'
import { allImages, imageByName, rankOf, searchImages } from '@/lib/hub'

/** 镜像详情页:"nginx latest docker tag" / "postgres image versions" 长尾着陆页。 */
export const revalidate = 86400

export function generateStaticParams() {
  return allImages().map((m) => ({ name: m.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const m = imageByName(name)
  if (!m) return {}
  return {
    title: `${m.name} Docker Image — Tags, Pulls, Latest Versions`,
    description: `The ${m.name} official Docker image (library/${m.name}): ${fullNum(m.pulls)} pulls${m.tags.length ? `, latest tags through ${m.tags[0].tag} (${m.tags[0].updated})` : ''}. Full recent-tag table with build times.`,
    alternates: { canonical: `/image/${m.name}` },
  }
}

export default async function ImagePage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const m = imageByName(name)
  if (!m) notFound()

  const rank = rankOf(m.name)
  const similar = allImages()
    .filter((x) => x.name !== m.name && x.name[0] === m.name[0])
    .slice(0, 8)
  const latest = m.tags.find((t) => t.tag === 'latest')

  const faqLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...(m.tags.length
        ? [
            {
              '@type': 'Question',
              name: `What is the latest tag for the ${m.name} Docker image?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The most recent ${m.name} tag build is ${m.tags[0].tag} (pushed ${m.tags[0].updated}). ${latest ? `The "latest" tag was last built ${latest.updated}.` : ''}`,
              },
            },
          ]
        : []),
      ...(m.pulls != null
        ? [
            {
              '@type': 'Question',
              name: `How many times has ${m.name} been pulled?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `library/${m.name} has ${fullNum(m.pulls)} pulls on Docker Hub, ranking #${rank} among official images.`,
              },
            },
          ]
        : []),
    ],
  })

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Images', url: `${BASE}/images` },
    { name: m.name },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        library/{m.name} · rank #{rank} · {bigNum(m.pulls)} pulls
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {m.name} Docker image
      </h1>
      {m.desc ? <p className="mt-3 text-[15px] text-ink/70">{m.desc}</p> : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">Pulls</div>
          <div className="mt-1 text-2xl font-bold">{fullNum(m.pulls)}</div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">Stars</div>
          <div className="mt-1 text-2xl font-bold">{fullNum(m.stars)}</div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">Last pushed</div>
          <div className="mt-1 text-2xl font-bold">{m.updated || '—'}</div>
          <div className="mt-0.5 text-[12px] text-ink/50">repo-level last_updated</div>
        </div>
      </section>

      <AdSlot slot="image-below-cards" />

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Recent tags</h2>
        <p className="mt-1 text-[13px] text-ink/55">
          The {m.tags.length} most recent builds, newest first (recency view, not full history).
        </p>
        {m.tags.length ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-ink/10 text-left text-[12px] uppercase tracking-wider text-ink/45">
                  <th className="px-4 py-2.5">Tag</th>
                  <th className="px-4 py-2.5 text-right">Pushed</th>
                </tr>
              </thead>
              <tbody>
                {m.tags.map((t) => (
                  <tr key={t.tag} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-2 font-mono font-medium">
                      {t.tag}
                      {t.tag === 'latest' ? (
                        <span className="ml-2 rounded bg-brand/10 px-1.5 py-0.5 text-[11px] font-sans font-semibold text-brand">
                          latest
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-right text-ink/70">{t.updated || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
            No recent tags synced for this image — Docker Hub returned none. We show nothing rather
            than guess.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">More images starting with &ldquo;{m.name[0].toUpperCase()}&rdquo;</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {similar.map((x) => (
            <li key={x.name}>
              <Link
                href={`/image/${x.name}`}
                className="rounded-lg border border-ink/12 bg-white px-3 py-1.5 text-[13.5px] font-semibold hover:border-ink/40"
              >
                {x.name} <span className="text-ink/40">({bigNum(x.pulls)})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
