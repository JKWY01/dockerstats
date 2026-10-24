import { NextResponse } from 'next/server'
import { allImages, imageByName, meta, rankOf, searchImages } from '@/lib/hub'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const q = searchParams.get('q')

  if (name) {
    const m = imageByName(name)
    if (!m) return NextResponse.json({ error: 'unknown image' }, { status: 404 })
    return NextResponse.json(
      { image: m, rank: rankOf(m.name), source: 'Docker Hub public API' },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
    )
  }
  if (q) {
    return NextResponse.json(
      { query: q, results: searchImages(q, 30).map((m) => ({ name: m.name, pulls: m.pulls })) },
      { headers: { 'access-control-allow-origin': '*' } },
    )
  }
  return NextResponse.json(
    { dataset: meta(), usage: '?name=nginx for one image; ?q=<keyword> to search' },
    { headers: { 'access-control-allow-origin': '*' } },
  )
}
