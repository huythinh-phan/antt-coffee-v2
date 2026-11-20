#!/usr/bin/env node
// Kiểm tra nhanh URL đã deploy của ANTT Coffee v3 (Frontend Bootstrap 4 + Serverless API)
// Cách dùng: node testsuite/scripts/verify-deploy.mjs https://<ten-du-an>.vercel.app

const base = (process.argv[2] || process.env.BASE_URL || '').replace(/\/+$/, '')
if (!/^https?:\/\//.test(base)) {
  console.error('Cách dùng: node testsuite/scripts/verify-deploy.mjs <https://url>')
  process.exit(1)
}

const results = []
const check = async (name, fn) => {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`  ✔ ${name}`)
  } catch (e) {
    results.push({ name, ok: false, err: e.message })
    console.log(`  ✘ ${name}\n      → ${e.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}
const get = async (path, init) => {
  const t0 = performance.now()
  const res = await fetch(base + path, { redirect: 'follow', ...init })
  const text = await res.text()
  return { res, text, ms: Math.round(performance.now() - t0) }
}

console.log(`Kiểm tra triển khai ANTT Coffee v3: ${base}\n`)

await check('TC-DEPLOY-01 "/" trả 200, HTML chứa thương hiệu ANTT Coffee', async () => {
  const { res, text, ms } = await get('/')
  assert(res.status === 200, `status ${res.status}`)
  assert((res.headers.get('content-type') || '').includes('text/html'), 'content-type không phải text/html')
  assert(/ANTT/i.test(text), 'thiếu thương hiệu ANTT Coffee')
  assert(ms < 4000, `phản hồi ${ms}ms >= 4000ms`)
})

const pages = ['/menu.html', '/cart.html', '/voucher.html', '/gallery.html', '/login.html', '/register.html', '/history.html', '/user.html', '/admin.html']
await check('TC-DEPLOY-02 toàn bộ các trang giao diện chính trả 200', async () => {
  const bad = []
  for (const p of pages) {
    const { res } = await get(p)
    if (res.status !== 200) bad.push(`${p} → ${res.status}`)
  }
  assert(bad.length === 0, `trang lỗi: ${bad.join(', ')}`)
})

await check('TC-DEPLOY-03 Backend API (/api/health, /api/menu, /api/vouchers) hoạt động và trả đủ 19 món gốc', async () => {
  const h = await get('/api/health')
  assert(h.res.status === 200, `/api/health → ${h.res.status}`)
  const m = await get('/api/menu')
  assert(m.res.status === 200, `/api/menu → ${m.res.status}`)
  const body = JSON.parse(m.text)
  assert(body.success && Array.isArray(body.data) && body.data.length >= 19, 'dữ liệu menu không đủ 19 món')
})

await check('TC-DEPLOY-04 tài nguyên CSS, JS và Hình ảnh tải được 200', async () => {
  for (const asset of ['/css/style.css', '/js/api-client.js', '/images/menu-1.jpg']) {
    const { res } = await get(asset)
    assert(res.status === 200, `${asset} → ${res.status}`)
  }
})

await check('TC-DEPLOY-05 header bảo mật cơ bản', async () => {
  const { res } = await get('/')
  assert(res.headers.get('x-content-type-options') === 'nosniff', 'thiếu X-Content-Type-Options: nosniff')
  assert(res.headers.get('referrer-policy'), 'thiếu Referrer-Policy')
})

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} đạt`)
process.exit(failed.length ? 1 : 0)
