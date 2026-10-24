import Link from 'next/link'
import { DATA_SOURCE } from '@/lib/site'
import { meta } from '@/lib/hub'

export default function Footer() {
  const m = meta()
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 text-[13px] leading-relaxed text-ink/55">
        <p>
          All figures come from the {DATA_SOURCE} — {m.count} official images in the
          <span className="mx-1 font-mono">library</span> namespace, refreshed daily. Tag lists are
          the {m.top_tags} most recent builds per image (a recency view, not the full tag history).
          Not affiliated with Docker.
        </p>
        <p className="mt-3">
          <Link href="/sitemap.xml" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">Sitemap</Link>
          {' · '}
          <Link href="/llms.txt" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">llms.txt</Link>
          {' · '}
          <Link href="/api/image" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">JSON API</Link>
        </p>
      </div>
    </footer>
  )
}
