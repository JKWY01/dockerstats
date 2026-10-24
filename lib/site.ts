/** 站点身份与全局常量。 */
export const SITE_NAME = 'DockerStats'
export const SITE_TAGLINE = 'Docker official images: pull counts, tags, and update times'
export const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
export const DATA_SOURCE = 'Docker Hub public API + docker-library/official-images'

export function bigNum(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function fullNum(n: number | null | undefined): string {
  if (n == null) return '—'
  return Math.round(n).toLocaleString('en-US')
}
