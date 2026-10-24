import { describe, expect, it } from 'vitest'
import { allImages, groupByLetter, imageByName, meta, rankOf, searchImages, topByPulls } from '@/lib/hub'

const HAS_DATA = allImages().length > 0

describe.skipIf(!HAS_DATA)('docker hub data integrity', () => {
  it('has a sane dataset size and unique names', () => {
    expect(allImages().length).toBeGreaterThanOrEqual(100)
    expect(new Set(allImages().map((m) => m.name)).size).toBe(allImages().length)
  })

  it('is sorted by pulls descending', () => {
    const images = allImages().filter((m) => m.pulls != null)
    for (let i = 1; i < images.length; i += 1) {
      expect(images[i].pulls!).toBeLessThanOrEqual(images[i - 1].pulls!)
    }
  })

  it('anchor: alpine or ubuntu sits in the top 5 with 1B+ pulls', () => {
    const top5 = topByPulls(5).map((m) => m.name)
    expect(top5).toContain('alpine')
    expect(topByPulls(1)[0].pulls!).toBeGreaterThan(1_000_000_000)
  })

  it('tags are recent-capped views', () => {
    for (const m of allImages().slice(0, 20)) {
      expect(m.tags.length, m.name).toBeLessThanOrEqual(meta().top_tags)
    }
  })

  it('directory groups cover every image', () => {
    const grouped = groupByLetter().reduce((n, g) => n + g.images.length, 0)
    expect(grouped).toBe(allImages().length)
  })
})

describe('accessors degrade honestly', () => {
  it('unknown names return null / zero', () => {
    expect(imageByName('not-an-image')).toBeNull()
    expect(searchImages('')).toEqual([])
    expect(rankOf('not-an-image')).toBe(0)
  })
})
