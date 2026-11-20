const currencyFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
export const currency = (n) => currencyFmt.format(Number.isFinite(n) ? n : 0)

const dtFmt = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** dd/MM/yyyy HH:mm theo giờ địa phương */
export function formatDateTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  const p = Object.fromEntries(dtFmt.formatToParts(d).map((x) => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}
