#!/usr/bin/env node
/** 线上体检:关键页/排行/API/sitemap 全查,失败退出 1。 */
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '')
if (!SITE_URL) { console.error('[health] SITE_URL not configured'); process.exit(1) }
const failures = []
const check = async (name, fn) => {
  try { await fn(); console.log(`[health] ✓ ${name}`) } catch (err) {
    failures.push(name); console.error(`[health] ✗ ${name}: ${err.message}`)
  }
}
const get = async (path, timeout = 30_000) => {
  const res = await fetch(`${SITE_URL}${path}`, { signal: AbortSignal.timeout(timeout), headers: { 'User-Agent': 'dockerstats-healthcheck' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}
await check('home renders', async () => {
  const html = await get('/')
  if (!/Docker official image stats/i.test(html)) throw new Error('missing hero')
})
await check('api returns nginx with tags', async () => {
  const body = JSON.parse(await get('/api/image?name=nginx'))
  if (!body.image?.pulls || body.image.pulls < 1_000_000_000) throw new Error(`bad pulls: ${body.image?.pulls}`)
  if (!Array.isArray(body.image?.tags) || body.image.tags.length === 0) throw new Error('missing tags')
})
await check('image page renders tag table', async () => {
  const html = await get('/image/nginx')
  if (!/library\/nginx/.test(html)) throw new Error('missing repo name')
  if (!/Recent tags/i.test(html)) throw new Error('missing tags section')
})
await check('rankings lists images', async () => {
  const html = await get('/rankings')
  const count = (html.match(/\/image\//g) ?? []).length
  if (count < 50) throw new Error(`only ${count} links`)
})
await check('sitemap covers images', async () => {
  const xml = await get('/sitemap.xml', 60_000)
  const count = (xml.match(/<url>/g) ?? []).length
  if (count < 120) throw new Error(`only ${count} URLs`)
})
await check('llms.txt documents the API', async () => {
  const body = await get('/llms.txt')
  if (!body.includes('/api/image')) throw new Error('api not documented')
})
if (failures.length > 0) { console.error(`[health] FAILED: ${failures.join(' | ')}`); process.exit(1) }
console.log('[health] all checks passed')
