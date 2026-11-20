#!/usr/bin/env node
// Kiểm tra nhanh một URL đã deploy (Vercel...). Không cần phụ thuộc ngoài; cần Node >= 18.
//   node testsuite/scripts/verify-deploy.mjs https://<ten-du-an>.vercel.app
// Mã thoát: 0 = tất cả đạt, 1 = có lỗi.  (Tương ứng TC-DEPLOY-01..07)

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
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }
const get = async (path, init) => {
  const t0 = performance.now()
  const res = await fetch(base + path, { redirect: 'follow', ...init })
  const text = await res.text()
  return { res, text, ms: Math.round(performance.now() - t0) }
}

console.log(`Kiểm tra triển khai: ${base}\n`)

let indexHtml = ''
await check('TC-DEPLOY-01 "/" trả 200, HTML chứa #root và tiêu đề Coffee Manager', async () => {
  const { res, text, ms } = await get('/')
  assert(res.status === 200, `status ${res.status}`)
  assert((res.headers.get('content-type') || '').includes('text/html'), 'content-type không phải text/html')
  assert(text.includes('id="root"'), 'thiếu #root')
  assert(/<title>[^<]*Coffee Manager/i.test(text), 'thiếu <title> Coffee Manager')
  assert(ms < 3000, `phản hồi ${ms}ms ≥ 3000ms`)
  indexHtml = text
})

const deepPaths = ['/menu', '/order', '/login', '/register', '/history', '/account', '/admin/orders', '/admin/menu', '/admin/promos', '/admin/feedback', '/admin/customers', '/orders/abc', '/duong-dan-khong-ton-tai']
await check('TC-DEPLOY-02 mọi đường dẫn SPA (deep link, kể cả không tồn tại) trả 200 + index.html (rewrite)', async () => {
  const bad = []
  for (const p of deepPaths) {
    const { res, text } = await get(p)
    if (res.status !== 200 || !text.includes('id="root"')) bad.push(`${p} → ${res.status}`)
  }
  assert(bad.length === 0, `không rewrite được: ${bad.join(', ')}`)
})

await check('TC-DEPLOY-03 JS và CSS được tham chiếu trong index.html tải được (200, đúng content-type)', async () => {
  const js = [...indexHtml.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])
  const css = [...indexHtml.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1])
  assert(js.length > 0, 'không tìm thấy thẻ <script src>')
  assert(css.length > 0, 'không tìm thấy <link ... .css>')
  for (const u of js) {
    const { res } = await get(new URL(u, base + '/').pathname)
    assert(res.status === 200, `${u} → ${res.status}`)
    assert(/javascript/.test(res.headers.get('content-type') || ''), `${u} sai content-type: ${res.headers.get('content-type')}`)
  }
  for (const u of css) {
    const { res } = await get(new URL(u, base + '/').pathname)
    assert(res.status === 200, `${u} → ${res.status}`)
    assert(/css/.test(res.headers.get('content-type') || ''), `${u} sai content-type`)
  }
})

// Thông tin (không làm fail): rewrite catch-all có thể trả index.html cho file /assets/ không tồn tại.
{
  try {
    const { res, text } = await get('/assets/khong-ton-tai-123.js')
    if (res.status === 200 && text.includes('id="root"')) {
      console.log('  ℹ TC-DEPLOY-04 (thông tin) /assets/<không tồn tại> trả index.html 200 – chấp nhận được; có thể loại /assets khỏi rewrite nếu muốn 404 thật')
    } else {
      console.log(`  ℹ TC-DEPLOY-04 (thông tin) /assets/<không tồn tại> → ${res.status}`)
    }
  } catch (e) {
    console.log(`  ℹ TC-DEPLOY-04 (thông tin) không kiểm tra được: ${e.message}`)
  }
}

await check('TC-DEPLOY-05 header bảo mật cơ bản', async () => {
  const { res } = await get('/')
  const h = (k) => res.headers.get(k)
  assert(h('x-content-type-options') === 'nosniff', 'thiếu X-Content-Type-Options: nosniff')
  assert(h('referrer-policy'), 'thiếu Referrer-Policy')
  assert(h('x-frame-options') || /frame-ancestors/.test(h('content-security-policy') || ''), 'thiếu X-Frame-Options/frame-ancestors')
})

await check('TC-DEPLOY-06 /assets/* có cache dài (immutable)', async () => {
  const js = [...indexHtml.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]).find((u) => u.includes('/assets/'))
  assert(js, 'không có tài nguyên /assets/')
  const { res } = await get(new URL(js, base + '/').pathname)
  const cc = res.headers.get('cache-control') || ''
  assert(/max-age=\d{6,}/.test(cc) || /immutable/.test(cc), `Cache-Control: "${cc}"`)
})

await check('TC-DEPLOY-07 favicon không 404 và không bị rewrite thành HTML', async () => {
  const m = indexHtml.match(/<link[^>]+rel="[^"]*icon[^"]*"[^>]+href="([^"]+)"/i)
  const href = m ? m[1] : '/favicon.ico'
  const { res } = await get(new URL(href, base + '/').pathname)
  assert(res.status === 200, `${href} → ${res.status}`)
  assert(!(res.headers.get('content-type') || '').includes('text/html'), `${href} đang trả HTML (rewrite), không phải ảnh`)
})

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} đạt`)
process.exit(failed.length ? 1 : 0)
