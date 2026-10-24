import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/site'
import { allImages } from '@/lib/hub'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/images`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/rankings`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    ...allImages().map((m) => ({
      url: `${BASE}/image/${m.name}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]
}
