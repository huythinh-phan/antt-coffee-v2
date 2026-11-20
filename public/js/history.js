let userOrdersList = []

document.addEventListener('DOMContentLoaded', async () => {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    user = null
  }
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  await loadHistory(user.Acc_id)

  const btnApply = document.getElementById('btnApply')
  if (btnApply) {
    btnApply.onclick = () => {
      const status = document.getElementById('fStatus').value
      const filtered =
        status === 'all'
          ? userOrdersList
          : userOrdersList.filter((o) => o.Status === status || (status === 'CREATED' && o.Status === 'Pending'))
      renderList(filtered)
    }
  }
})

async function loadHistory(accId) {
  const loading = document.getElementById('orderList')
  if (loading) loading.innerHTML = '<p class="text-center text-white">Đang tải...</p>'

  const res = await API.get(`/orders/user/${accId}`)
  userOrdersList = res.success && Array.isArray(res.data) ? res.data : []
  renderStats(userOrdersList)
  renderList(userOrdersList)
}

window.cancelMyOrder = async (orderId) => {
  if (!confirm(`Bạn muốn hủy đơn hàng #${orderId}?`)) return
  const res = await API.put(`/orders/${orderId}`, { status: 'Cancelled' })
  if (res.success) {
    if (window.showToast) window.showToast(`Đã hủy đơn #${orderId}`)
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (user) await loadHistory(user.Acc_id)
  } else {
    alert(res.message || 'Không thể hủy đơn')
  }
}

function renderList(list) {
  const container = document.getElementById('orderList')
  if (!container) return

  if (list.length === 0) {
    container.innerHTML = '<p class="text-center text-white mt-5" data-testid="history-empty">Bạn chưa có đơn hàng nào.</p>'
    return
  }

  container.innerHTML = list
    .map((o) => {
      const itemsHtml = (o.items || [])
        .map(
          (i) => `
        <div class="d-flex align-items-center mb-2" style="border-bottom:1px dashed #ffffff30; padding-bottom:5px;">
          <img src="${API.fixImg(i.image)}" style="width:50px;height:50px;border-radius:4px;margin-right:15px;object-fit:cover;">
          <div style="flex:1;">
            <div style="color:white;">${i.name}</div>
            <small style="color:#ccc;">x${i.qty}</small>
          </div>
          <div style="color:#c49b63;">${API.vnd(i.price)}</div>
        </div>
      `,
        )
        .join('')

      let badgeColor = 'warning'
      let footerAction = ''

      if (o.Status === 'Completed') {
        badgeColor = 'success'
        footerAction = `
          <div class="text-right mt-3 border-top pt-3 border-secondary">
            <a href="reviews.html?orderId=${o.Order_id}" class="btn btn-primary font-weight-bold py-2 px-4" data-testid="order-rate-${o.Order_id}">
              Viết nhận xét
            </a>
          </div>`
      } else if (o.Status === 'Cancelled') {
        badgeColor = 'danger'
      } else if (o.Status === 'Processing') {
        badgeColor = 'info'
      } else if (o.Status === 'CREATED' || o.Status === 'Pending') {
        footerAction = `
          <div class="text-right mt-3 border-top pt-3 border-secondary">
            <button type="button" class="btn btn-outline-danger py-2 px-3" data-testid="order-cancel-${o.Order_id}" onclick="cancelMyOrder(${o.Order_id})">
              Hủy đơn
            </button>
          </div>`
      }

      return `
      <div class="history-card p-3 mb-4 animate-box fadeInUp animated-fast" data-testid="order-card" data-order-id="${o.Order_id}" style="background:rgba(255,255,255,0.05); border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
        <div class="d-flex justify-content-between mb-3 border-bottom border-secondary pb-2">
          <strong class="text-white">Đơn #${o.Order_id} <small class="text-muted ml-2">${new Date(o.Order_date).toLocaleString('vi-VN')}</small></strong>
          <span class="badge badge-${badgeColor}" data-testid="order-status" style="font-size:12px; padding:5px 10px;">${o.Status}</span>
        </div>
        <div class="history-body" data-testid="order-items">${itemsHtml}</div>
        <div class="d-flex justify-content-between align-items-center mt-2 pt-2" style="border-top:1px solid rgba(255,255,255,0.1);">
          <span class="text-white mr-2">Tổng tiền:</span>
          <strong style="color:#c49b63; font-size:18px;">${API.vnd(o.Total_amount)}</strong>
        </div>
        ${footerAction}
      </div>`
    })
    .join('')
}

function renderStats(list) {
  const safeElement = (id, val) => {
    const el = document.getElementById(id)
    if (el) el.textContent = val
  }

  safeElement('stCount', list.length)
  safeElement('stDone', list.filter((o) => o.Status === 'Completed').length)
  safeElement('stCancel', list.filter((o) => o.Status === 'Cancelled').length)

  const total = list.filter((o) => o.Status === 'Completed').reduce((s, o) => s + Number.parseFloat(o.Total_amount || 0), 0)
  safeElement('stSpent', API.vnd(total))
}
