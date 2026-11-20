let currentDiscount = 0

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('cartItems')) return
  renderCart()
  checkUserStatus()
})

async function checkUserStatus() {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    user = null
  }
  const voucherSection = document.getElementById('voucherSection')

  if (user) {
    loadVouchers()
    try {
      const res = await API.get('/customers')
      if (res.success && Array.isArray(res.data)) {
        const profile = res.data.find((c) => Number(c.Acc_id) === Number(user.Acc_id))
        if (profile) {
          const shipName = document.getElementById('shipName')
          const shipPhone = document.getElementById('shipPhone')
          const shipAddr = document.getElementById('shipAddress')
          if (shipName && !shipName.value) shipName.value = profile.Full_name || ''
          if (shipPhone && !shipPhone.value) shipPhone.value = profile.Phone || ''
          if (shipAddr && !shipAddr.value) shipAddr.value = profile.Address || ''
        }
      }
    } catch {
      /* ignore */
    }
  } else if (voucherSection) {
    const sel = document.getElementById('savedVouchersSelect')
    const inp = document.getElementById('voucherInput')
    const msg = document.getElementById('voucherMessage')
    if (sel?.parentNode) sel.parentNode.style.display = 'none'
    if (inp?.parentNode) inp.parentNode.style.display = 'none'
    if (msg) msg.innerText = 'Đăng nhập để sử dụng Voucher'
  }
}

function getCart() {
  try {
    const c = JSON.parse(localStorage.getItem('myCart'))
    return Array.isArray(c) ? c : []
  } catch {
    return []
  }
}

function renderCart() {
  const cart = getCart()
  const tbody = document.getElementById('cartItems')
  if (!tbody) return
  let total = 0

  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-white p-5" data-testid="cart-empty">Giỏ hàng của bạn đang trống</td></tr>'
    const totalEl = document.getElementById('cartTotal')
    if (totalEl) totalEl.dataset.original = '0'
    currentDiscount = 0
    updateTotal(0, 0)
    return
  }

  tbody.innerHTML = cart
    .map((item, idx) => {
      const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 1)
      total += itemTotal
      const imgSrc = API.fixImg(item.img)

      return `
      <tr class="text-center" data-testid="cart-item-${item.id}">
        <td class="product-remove"><a href="#" class="btn-remove" data-testid="cart-remove-${item.id}" onclick="removeCartItem(${idx}); return false;"><span class="icon-close"></span></a></td>
        <td class="image-prod"><div class="img" style="background-image:url('${imgSrc}');"></div></td>
        <td class="product-name"><h3>${item.name}</h3></td>
        <td class="price">${API.vnd(item.price)}</td>
        <td class="quantity">
          <div class="input-group mb-3" style="width: 100%; justify-content: center;">
            <input type="number" class="quantity form-control input-number"
                   data-testid="cart-qty-${item.id}"
                   value="${item.qty}" min="1" max="100"
                   onchange="updateQty(${idx}, this.value)"
                   style="color: white !important;">
          </div>
        </td>
        <td class="total">${API.vnd(itemTotal)}</td>
      </tr>`
    })
    .join('')

  const totalEl = document.getElementById('cartTotal')
  if (totalEl) totalEl.dataset.original = String(total)
  updateTotal(total, Math.min(currentDiscount, total))
}

async function loadVouchers() {
  const res = await API.get('/vouchers')
  const select = document.getElementById('savedVouchersSelect')
  if (res.success && Array.isArray(res.data) && select) {
    select.innerHTML = '<option value="">-- Chọn mã ưu đãi --</option>'
    res.data.forEach((v) => {
      const desc = (v.Description || '').toLowerCase()
      const isPercent = desc.includes('percent')
      const displayValue = isPercent ? `${Number.parseInt(v.Value, 10)}%` : API.vnd(v.Value)
      select.insertAdjacentHTML('beforeend', `<option value="${v.Voucher_code}">${v.Voucher_code} - Giảm ${displayValue}</option>`)
    })

    select.onchange = () => {
      const inp = document.getElementById('voucherInput')
      if (inp) inp.value = select.value
      window.applyVoucher()
    }
  }
}

window.applyVoucher = async () => {
  const inp = document.getElementById('voucherInput')
  const code = (inp?.value || '').trim().toUpperCase()
  const subtotal = Number.parseInt(document.getElementById('cartTotal')?.dataset.original || '0', 10)
  const msg = document.getElementById('voucherMessage')

  if (!code) {
    currentDiscount = 0
    if (msg) msg.textContent = ''
    updateTotal(subtotal, 0)
    return
  }

  const res = await API.get('/vouchers')
  const list = res.success && Array.isArray(res.data) ? res.data : []
  const voucher = list.find((v) => String(v.Voucher_code).toUpperCase() === code)

  if (!voucher) {
    if (msg) {
      msg.textContent = 'Mã không hợp lệ'
      msg.className = 'text-danger mt-0 mb-3'
    }
    currentDiscount = 0
    updateTotal(subtotal, 0)
    return
  }

  if (subtotal < Number(voucher.Min_order_val)) {
    if (msg) {
      msg.textContent = `Đơn tối thiểu ${API.vnd(voucher.Min_order_val)}`
      msg.className = 'text-danger mt-0 mb-3'
    }
    currentDiscount = 0
    updateTotal(subtotal, 0)
    return
  }

  const desc = (voucher.Description || '').toLowerCase()
  const isPercent = desc.includes('percent')
  let discount = isPercent ? Math.round(subtotal * (Number(voucher.Value) / 100)) : Number(voucher.Value)
  if (discount > subtotal) discount = subtotal

  currentDiscount = discount
  if (msg) {
    msg.textContent = `Đã giảm ${API.vnd(discount)}`
    msg.className = 'text-success mt-0 mb-3'
  }
  updateTotal(subtotal, discount)
}

function updateTotal(sub, discount = 0) {
  const final = Math.max(0, sub - discount)
  const cartTotalEl = document.getElementById('cartTotal')
  const discountEl = document.getElementById('discountAmount')
  const finalEl = document.getElementById('finalTotal')
  if (cartTotalEl) cartTotalEl.innerText = API.vnd(sub)
  if (discountEl) discountEl.innerText = API.vnd(discount)
  if (finalEl) {
    finalEl.innerText = API.vnd(final)
    finalEl.dataset.final = String(final)
  }
}

window.removeCartItem = (idx) => {
  const cart = getCart()
  cart.splice(idx, 1)
  localStorage.setItem('myCart', JSON.stringify(cart))
  renderCart()
  if (window.updateCartCount) window.updateCartCount()
}

window.updateQty = (idx, val) => {
  const cart = getCart()
  if (!cart[idx]) return
  let newQty = Number.parseInt(val, 10)
  if (!Number.isFinite(newQty) || newQty < 1) newQty = 1
  if (newQty > 100) newQty = 100
  cart[idx].qty = newQty
  localStorage.setItem('myCart', JSON.stringify(cart))
  renderCart()
  if (window.updateCartCount) window.updateCartCount()
}

window.processCheckout = async () => {
  const cart = getCart()
  if (cart.length === 0) return alert('Giỏ hàng trống!')

  const name = (document.getElementById('shipName')?.value || '').trim()
  const phone = (document.getElementById('shipPhone')?.value || '').trim()
  const address = (document.getElementById('shipAddress')?.value || '').trim()

  if (!name || !phone || !address) {
    return alert('Vui lòng nhập đầy đủ Tên, SĐT và Địa chỉ giao hàng!')
  }

  let user = null
  try {
    user = JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    user = null
  }
  const total = Number(document.getElementById('finalTotal')?.dataset.final || 0)

  let voucherCode = null
  if (user) {
    const input = document.getElementById('voucherInput')
    if (input && input.value.trim()) voucherCode = input.value.trim().toUpperCase()
  }

  const data = {
    userId: user ? user.Acc_id : null,
    items: cart,
    total,
    voucherCode,
    guestInfo: { name, phone, address },
  }

  const res = await API.post('/orders', data)
  if (res.success) {
    localStorage.removeItem('myCart')
    window.location.href = 'checkout.html'
  } else {
    alert('Lỗi: ' + (res.message || 'Không thể đặt hàng'))
  }
}
