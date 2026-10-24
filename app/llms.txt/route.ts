import { NextResponse } from 'next/server'
import { BASE, SITE_NAME } from '@/lib/site'
import { meta } from '@/lib/hub'

export const revalidate = 86400

export function GET(): Response {
  const m = meta()
  const body = `# ${SITE_NAME}

> Docker official image stats: all ${m.count} library images with pull counts, stars, and the ${m.top_tags} most recent tags per image.
> Live at ${BASE} . Data from the Docker Hub public API; AI crawlers and agents are welcome.

## Endpoints

- ${BASE}/api/image?name=nginx — one image incl. recent tags
- ${BASE}/api/image?q=postgres — search
- ${BASE}/sitemap.xml — full URL list

## Pages

- /image/<name> — one page per official image: pulls, stars, recent-tag table with push dates
- /images — directory; /rankings — most-pulled top 100

## Facts & policy

- "library" is Docker's official-images namespace (docker pull nginx = library/nginx).
- Tag lists are recency views (newest ${m.top_tags}), not full history; counts refresh daily.
`
  return new NextResponse(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  })
}
