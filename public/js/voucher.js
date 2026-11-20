document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('voucher-list')
  if (!container) return

  const res = await API.get('/vouchers')
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    container.innerHTML = res.data
      .map((v) => {
        const isPercent = v.Description && v.Description.toLowerCase().includes('percent')
        const displayValue = isPercent ? `${Number.parseInt(v.Value, 10)}%` : API.vnd(v.Value)

        return `
        <div class="col-md-4 mb-4" data-testid="voucher-card" data-code="${v.Voucher_code}">
          <div class="voucher-card text-center p-4" style="border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);">
            <div style="color: #c49b63; font-size: 24px; font-weight: bold;">GIẢM ${displayValue}</div>
            <h3 class="text-white mt-2">${v.Voucher_name}</h3>
            <p class="text-warning font-weight-bold" style="font-size:18px;">${v.Voucher_code}</p>
            <p style="color:#aaa; font-size:13px;">Đơn tối thiểu: ${API.vnd(v.Min_order_val)}</p>
            <button type="button" class="btn btn-primary btn-sm" onclick="copyCode('${v.Voucher_code}')">Sao chép mã</button>
          </div>
        </div>
      `
      })
      .join('')
  } else {
    container.innerHTML = '<p class="text-center text-white col-12">Hiện chưa có voucher nào.</p>'
  }
})

window.copyCode = async (code) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code)
    }
  } catch {
    /* ignore clipboard permissions in headless browsers */
  }
  if (window.showToast) window.showToast('Đã sao chép mã: ' + code)
  else alert('Đã sao chép mã: ' + code)
}
