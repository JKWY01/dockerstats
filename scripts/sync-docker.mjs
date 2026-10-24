#!/usr/bin/env node
/**
 * Docker Hub 官方镜像(library/*)同步。
 *
 *   源  ① docker-library/official-images 的 library 清单(raw.githubusercontent,官方镜像名单)
 *        ② hub.docker.com/v2 公开 API(免鉴权):仓库信息(pull_count/star/描述)+ 近期标签
 *        hub.docker.com 与 raw.githubusercontent 对部分出口(含本沙盒)不通 —— 设计为 CI 上跑,
 *        与 BLS 站同一模式:数据落仓库,站点读路径零外呼。
 *
 *   纪律  数值要么来自 Docker Hub 接口,要么缺失(null);标签只收最近 TOP_TAGS 个(按
 *        last_updated 降序),页面如实标注"近期标签视图,非全量"。
 *
 * 运行:`node scripts/sync-docker.mjs`。幂等:数据本体无变化不写文件。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = join(ROOT, 'data', 'docker-hub.json')
const LIBRARY_URL =
  'https://api.github.com/repos/docker-library/official-images/contents/library'
const REPO_URL = (name) => `https://hub.docker.com/v2/repositories/library/${name}/`
const TAGS_URL = (name, page) =>
  `https://hub.docker.com/v2/repositories/library/${name}/tags?page_size=100&ordering=-last_updated&page=${page}`
const TOP_TAGS = Number(process.env.DOCKER_TOP_TAGS ?? 50)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'dockerstats-sync', Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 4) throw new Error(`HTTP ${res.status}`)
      await sleep(attempt * 6000)
      return getJson(url, attempt + 1)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch (err) {
    if (attempt >= 4) throw err
    await sleep(attempt * 6000)
    return getJson(url, attempt + 1)
  }
}

async function main() {
  // ① 官方镜像名单 = official-images 仓库 library/ 目录(GitHub contents API,处处可达)
  const listRaw = await getJson(LIBRARY_URL)
  const names = (Array.isArray(listRaw) ? listRaw : [])
    .map((x) => x.name)
    .filter((n) => /^[a-z][a-z0-9.-]*$/.test(n))
  const uniq = [...new Set(names)]
  if (uniq.length < 100) throw new Error(`library list sanity failed: ${uniq.length}`)
  console.log(`[sync-docker] ${uniq.length} official images`)

  // ② 逐仓库:信息 + 近期标签
  const images = []
  let failed = 0
  for (let i = 0; i < uniq.length; i += 1) {
    const name = uniq[i]
    try {
      const repo = await getJson(REPO_URL(name))
      let tags = []
      try {
        const t1 = await getJson(TAGS_URL(name, 1))
        tags = t1.results ?? []
        if (tags.length === 100 && TOP_TAGS > 100) {
          const t2 = await getJson(TAGS_URL(name, 2))
          tags = [...tags, ...(t2.results ?? [])]
        }
      } catch {
        /* 标签失败不致命:留空数组 */
      }
      images.push({
        name,
        desc: (repo.description ?? '').trim(),
        pulls: repo.pull_count ?? null,
        stars: repo.star_count ?? null,
        updated: (repo.last_updated ?? '').slice(0, 10),
        tags: tags
          .slice(0, TOP_TAGS)
          .filter((t) => t.tag_status !== 'deprecated')
          .map((t) => ({ tag: t.name, updated: (t.last_updated ?? '').slice(0, 10) })),
      })
    } catch (err) {
      failed += 1
      console.log(`[sync-docker] ${name}: ${err.message} — skipped`)
    }
    if (i % 25 === 24) console.log(`[sync-docker] ${i + 1}/${uniq.length}...`)
    await sleep(600)
  }

  if (images.length < 100) {
    throw new Error(`too many failures: only ${images.length} images (${failed} failed)`)
  }
  images.sort((a, b) => (b.pulls ?? 0) - (a.pulls ?? 0))
  const top = images[0]
  if (!top.pulls || top.pulls < 1_000_000_000) {
    throw new Error(`sanity failed: top pulls ${top.name}=${top.pulls}`)
  }

  const payload = {
    meta: {
      source: 'Docker Hub public API + docker-library/official-images (library namespace)',
      fetched_at: new Date().toISOString(),
      count: images.length,
      top_tags: TOP_TAGS,
    },
    images,
  }

  const prev = existsSync(DATA_PATH) ? JSON.parse(readFileSync(DATA_PATH, 'utf8')) : null
  const sameData =
    prev && JSON.stringify(prev.images.map((m) => ({ ...m, updated: m.updated }))) === JSON.stringify(payload.images)
  if (sameData) {
    console.log(`[sync-docker] images=${images.length} — no change, skip write`)
    return
  }
  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(DATA_PATH, JSON.stringify(payload) + '\n')
  console.log(`[sync-docker] images=${images.length} failed=${failed} — written; top: ${top.name} ${top.pulls}`)
}

main().catch((err) => {
  console.error(`[sync-docker] failed: ${err.message}`)
  process.exit(1)
})
