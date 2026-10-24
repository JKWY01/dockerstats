/** Docker Hub 官方镜像数据访问层。
 *
 * 数据在 data/docker-hub.json(同步脚本写入,随仓库分发),站点读路径零外呼。
 * 纪律:数值要么来自 Docker Hub 接口,要么缺失;标签是"近期视图",页面如实标注。
 */

import raw from '@/data/docker-hub.json'

export interface ImageTag {
  tag: string
  updated: string
}

export interface ImageEntry {
  /** 镜像名(library 命名空间) */
  name: string
  desc: string
  pulls: number | null
  stars: number | null
  /** YYYY-MM-DD */
  updated: string
  /** 近期标签(按 last_updated 降序,最多 meta.top_tags 个) */
  tags: ImageTag[]
}

interface DataShape {
  meta: { source: string; fetched_at: string; count: number; top_tags: number }
  images: ImageEntry[]
}

const DATA = raw as unknown as DataShape
const BY_NAME = new Map<string, ImageEntry>(DATA.images.map((m) => [m.name, m]))

export function meta() {
  return DATA.meta
}

export function allImages(): ImageEntry[] {
  return DATA.images
}

export function imageByName(name: string): ImageEntry | null {
  return BY_NAME.get(name.toLowerCase()) ?? null
}

export function rankOf(name: string): number {
  return DATA.images.findIndex((m) => m.name === name) + 1
}

export function topByPulls(limit = 100): ImageEntry[] {
  return DATA.images.slice(0, limit)
}

export function searchImages(q: string, limit = 30): ImageEntry[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return DATA.images
    .filter((m) => m.name.includes(needle) || m.desc.toLowerCase().includes(needle))
    .slice(0, limit)
}

/** 按首字母分组(目录页)。 */
export function groupByLetter(): Array<{ letter: string; images: ImageEntry[] }> {
  const groups = new Map<string, ImageEntry[]>()
  for (const m of DATA.images) {
    const letter = m.name[0].toUpperCase()
    const list = groups.get(letter) ?? []
    list.push(m)
    groups.set(letter, list)
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([letter, images]) => ({ letter, images }))
}
