let adminMenuCache = []
let adminVoucherCache = []
let adminCustomerCache = []

document.addEventListener('DOMContentLoaded', () => {
  if (!guardAdmin()) return

  setupForm('prodForm', saveProduct)
  setupForm('voucherForm', saveVoucher)
  setupForm('customerForm', saveCustomer)

  renderAdminMenu()
  renderAdminOrders()
  renderAdminVouchers()
  renderAdminCustomers()
  renderAdminFeedbacks()

  if (window.$) {
    $('.custom-file-input').on('change', function () {
      const fileName = $(this).val().split('\\').pop()
      $(this).next('.custom-file-label').html(fileName)
    })
  }
})

function setupForm(id, handler) {
  const form = document.getElementById(id)
  if (form) form.addEventListener('submit', handler)
}

// --- 1. MENU ---
async function renderAdminMenu() {
  const res = await API.get('/menu')
  const tbody = document.getElementById('adminMenuBody')
  if (!res.success || !tbody) return
  adminMenuCache = res.data || []

  tbody.innerHTML = adminMenuCache
    .map(
      (p) => `
    <tr data-testid="admin-menu-row" data-name="${p.Item_name}">
      <td>${p.Item_id}</td>
      <td><img src="${API.fixImg(p.Image)}" style="width:50px;height:50px;object-fit:cover;border-radius:4px"></td>
      <td><strong>${p.Item_name}</strong></td>
      <td>${p.category || 'Chưa phân loại'}</td>
      <td>${API.vnd(p.Price)}</td>
      <td>
        <button type="button" class="btn btn-sm btn-info" onclick="fillPById(${p.Item_id})">Sửa</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteItem('menu', ${p.Item_id})">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join('')
}

window.fillPById = (id) => {
  const p = adminMenuCache.find((x) => Number(x.Item_id) === Number(id))
  if (p) window.fillP(p)
}

window.fillP = (p) => {
  const f = document.getElementById('prodForm')
  if (!f) return
  f.pid.value = p.Item_id
  f.name.value = p.Item_name
  f.price.value = Number.parseFloat(p.Price)
  if (p.Cate_id) f.cate_id.value = p.Cate_id
  if (f.description) f.description.value = p.Description || ''
  if (f.currentImage) f.currentImage.value = p.Image || ''
  if (window.$) $('.custom-file-label').html('Đang sửa: ' + p.Item_name)
  window.scrollTo(0, 0)
}

async function saveProduct(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  if (e.target.pid.value) formData.append('id', e.target.pid.value)

  const res = await API.upload('/menu', formData)
  if (res.success) {
    if (window.showToast) window.showToast('Lưu món thành công!')
    else alert('Thành công!')
    e.target.reset()
    e.target.pid.value = ''
    e.target.currentImage.value = ''
    if (window.$) $('.custom-file-label').html('Chọn ảnh')
    renderAdminMenu()
  } else {
    alert(res.message || 'Lỗi lưu món')
  }
}

// --- 2. VOUCHER ---
async function renderAdminVouchers() {
  const res = await API.get('/vouchers')
  const tbody = document.getElementById('adminVoucherBody')
  if (!res.success || !tbody) return
  adminVoucherCache = res.data || []

  tbody.innerHTML = adminVoucherCache
    .map((v) => {
      const isPercent = v.Description && v.Description.toLowerCase().includes('percent')
      const displayValue = isPercent ? `${Number.parseInt(v.Value, 10)}%` : API.vnd(v.Value)
      return `
      <tr data-testid="promo-row" data-code="${v.Voucher_code}">
        <td><b class="text-warning">${v.Voucher_code}</b></td>
        <td>${isPercent ? 'Giảm %' : 'Trừ tiền'}</td>
        <td>${displayValue}</td>
        <td>${API.vnd(v.Min_order_val)}</td>
        <td>
          <button type="button" class="btn btn-sm btn-info" onclick="fillVoucherById(${v.Voucher_id})">Sửa</button>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteItem('vouchers', ${v.Voucher_id})">Xóa</button>
        </td>
      </tr>
    `
    })
    .join('')
}

window.fillVoucherById = (id) => {
  const v = adminVoucherCache.find((x) => Number(x.Voucher_id) === Number(id))
  if (v) window.fillVoucher(v)
}

window.fillVoucher = (v) => {
  const f = document.getElementById('voucherForm')
  if (!f) return
  if (!f.id) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'id'
    f.appendChild(input)
  }
  f.id.value = v.Voucher_id
  f.code.value = v.Voucher_code
  f.value.value = Number.parseInt(v.Value, 10)
  f.min.value = Number.parseInt(v.Min_order_val, 10)
  f.type.value = v.Description && v.Description.toLowerCase().includes('percent') ? 'percent' : 'amount'
  window.scrollTo(0, 0)
}

async function saveVoucher(e) {
  e.preventDefault()
  const f = e.target
  const data = {
    id: f.id ? f.id.value : null,
    code: f.code.value.trim().toUpperCase(),
    type: f.type.value,
    value: Number.parseInt(f.value.value, 10),
    min: Number.parseInt(f.min.value, 10) || 0,
    name: `Mã ${f.code.value.trim().toUpperCase()}`,
  }
  const res = await API.post('/vouchers', data)
  if (res.success) {
    if (window.showToast) window.showToast(res.message || 'Lưu voucher thành công!')
    else alert('Thành công!')
    f.reset()
    if (f.id) f.id.value = ''
    renderAdminVouchers()
  } else {
    alert(res.message || 'Lỗi lưu voucher')
  }
}

// --- 3. CUSTOMER ---
async function renderAdminCustomers() {
  const res = await API.get('/customers')
  const tbody = document.getElementById('adminCustomerBody')
  if (!res.success || !tbody) return
  adminCustomerCache = res.data || []

  tbody.innerHTML = adminCustomerCache
    .map(
      (c) => `
    <tr data-testid="customer-row" data-username="${c.Username}">
      <td>${c.Acc_id}</td>
      <td><strong>${c.Full_name}</strong></td>
      <td>${c.Email}</td>
      <td>${c.Phone || '-'}</td>
      <td data-testid="customer-points">${c.Points || 0}</td>
      <td><span class="badge badge-${getLevelBadge(c.Level)}">${c.Level || 'Bronze'}</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-info" onclick="fillCustomerById(${c.Acc_id})">Sửa</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteItem('customers', ${c.Acc_id})">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join('')
}

function getLevelBadge(l) {
  if (l === 'Diamond') return 'info'
  if (l === 'Gold') return 'warning'
  if (l === 'Silver') return 'secondary'
  return 'dark'
}

window.fillCustomerById = (accId) => {
  const c = adminCustomerCache.find((x) => Number(x.Acc_id) === Number(accId))
  if (c) window.fillCustomer(c)
}

window.fillCustomer = (c) => {
  const f = document.getElementById('customerForm')
  if (!f) return
  f.acc_id.value = c.Acc_id
  f.fullname.value = c.Full_name
  f.email.value = c.Email
  f.phone.value = c.Phone || ''
  f.points.value = c.Points || 0
  f.username.disabled = true
  f.password.disabled = true
  f.username.placeholder = 'Không sửa username'
  window.scrollTo(0, 0)
}

async function saveCustomer(e) {
  e.preventDefault()
  const f = e.target
  const data = {
    acc_id: f.acc_id.value,
    fullname: f.fullname.value,
    email: f.email.value,
    phone: f.phone.value,
    points: f.points.value,
    username: f.username.value,
    password: f.password.value,
  }
  const res = await API.post('/customers', data)
  if (res.success) {
    if (window.showToast) window.showToast(res.message || 'Lưu khách hàng thành công!')
    else alert('Thành công!')
    f.reset()
    f.acc_id.value = ''
    f.username.disabled = false
    f.password.disabled = false
    f.username.placeholder = 'Tên đăng nhập (Chỉ nhập khi tạo mới)'
    renderAdminCustomers()
  } else {
    alert(res.message || 'Lỗi lưu khách hàng')
  }
}

// --- 4. FEEDBACK ---
async function renderAdminFeedbacks() {
  const res = await API.get('/feedback')
  const tbody = document.getElementById('adminFeedbackBody')
  if (!res.success || !tbody) return

  if (!res.data || res.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có đánh giá nào</td></tr>'
    return
  }

  tbody.innerHTML = res.data
    .map(
      (f) => `
    <tr data-testid="feedback-row">
      <td>#${f.Feedback_id}</td>
      <td>${f.Full_name || 'Khách hàng'}</td>
      <td>${f.Dish_name || '-'}</td>
      <td>${f.Content || ''}</td>
      <td class="text-warning">${f.Rating}★</td>
      <td>${f.Image ? `<a href="${API.fixImg(f.Image)}" target="_blank" style="color: #c49b63;">Xem ảnh</a>` : 'Không'}</td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="deleteItem('feedback', ${f.Feedback_id})">X</button></td>
    </tr>
  `,
    )
    .join('')
}

// --- 5. ORDERS ---
window.renderAdminOrders = async function () {
  const res = await API.get('/orders')
  const tbody = document.getElementById('adminOrderBody')
  if (!res.success || !tbody) return

  const badgeOf = (st) => {
    if (st === 'Completed') return 'success'
    if (st === 'Cancelled') return 'danger'
    if (st === 'Processing') return 'info'
    return 'warning'
  }

  tbody.innerHTML = (res.data || [])
    .map(
      (o) => `
    <tr data-testid="admin-order-row" data-order-id="${o.Order_id}">
      <td>#${o.Order_id}</td>
      <td>${o.Full_name || o.Shipping_Name || 'Khách vãng lai'}</td>
      <td>${API.vnd(o.Total_amount)}</td>
      <td>${new Date(o.Order_date).toLocaleDateString('vi-VN')}</td>
      <td><span class="badge badge-${badgeOf(o.Status)}" data-testid="order-status">${o.Status}</span></td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-info" data-testid="admin-order-detail-${o.Order_id}" onclick="viewOrderDetail(${o.Order_id})">Chi tiết</button>
      </td>
      <td class="text-center">
        <select class="form-control form-control-sm d-inline-block w-auto"
                data-testid="admin-order-status-${o.Order_id}"
                onchange="updateStatus(${o.Order_id}, this.value)">
          <option value="CREATED" ${o.Status === 'CREATED' || o.Status === 'Pending' ? 'selected' : ''}>Mới / Chờ xử lý</option>
          <option value="Processing" ${o.Status === 'Processing' ? 'selected' : ''}>Đang làm</option>
          <option value="Completed" ${o.Status === 'Completed' ? 'selected' : ''}>Hoàn thành</option>
          <option value="Cancelled" ${o.Status === 'Cancelled' ? 'selected' : ''}>Hủy</option>
        </select>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteItem('orders', ${o.Order_id})">X</button>
      </td>
    </tr>
  `,
    )
    .join('')
}

// XEM CHI TIẾT ĐƠN HÀNG (Popup Modal từ commit 9e92b81)
window.viewOrderDetail = async function (orderId) {
  try {
    const detailRes = await API.get(`/orders/${orderId}/details`)
    if (!detailRes.success || !detailRes.data) {
      alert('Không tìm thấy đơn hàng')
      return
    }
    const order = detailRes.data.info
    const items = detailRes.data.items || []

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 5px 8px;">${item.Item_name || item.name}</td>
        <td style="padding: 5px 8px; text-align: center;">${item.Quantity || item.qty}</td>
        <td style="padding: 5px 8px; text-align: right;">${API.vnd(item.Price || item.price)}</td>
        <td style="padding: 5px 8px; text-align: right;">${API.vnd((item.Quantity || item.qty) * (item.Price || item.price))}</td>
      </tr>
    `,
      )
      .join('')

    const modalHtml = `
      <div class="modal fade order-detail-modal" id="orderDetailModal" tabindex="-1" role="dialog" data-testid="order-detail-modal">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi Tiết Đơn Hàng #${order.Order_id}</h5>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
              <h6>Thông Tin Khách Hàng:</h6>
              <p><strong>Tên:</strong> ${order.Shipping_Name || order.Full_name || 'Khách vãng lai'}</p>
              <p><strong>SĐT:</strong> ${order.Shipping_Phone || 'N/A'}</p>
              <p><strong>Địa chỉ:</strong> ${order.Shipping_Address || 'N/A'}</p>
              <p><strong>Loại khách:</strong> ${order.Username ? 'Thành viên (' + order.Username + ')' : 'Khách vãng lai'}</p>
              <hr>
              <h6>Chi Tiết Món:</h6>
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Món</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml || '<tr><td colspan="4" style="text-align: center;">Không có dữ liệu</td></tr>'}</tbody>
              </table>
              <hr>
              <p><strong>Giá gốc:</strong> ${order.Init_amount ? API.vnd(order.Init_amount) : API.vnd(order.Total_amount)}</p>
              ${order.Discount_amount && order.Discount_amount > 0 ? `<p class="discount-info"><strong>Voucher giảm:</strong> -${API.vnd(order.Discount_amount)}</p>` : ''}
              <p><strong>Tổng tiền:</strong> <span class="total-amount">${API.vnd(order.Total_amount)}</span></p>
              <p><strong>Trạng thái:</strong> <span class="badge badge-warning">${order.Status}</span></p>
              <p><strong>Ngày đặt:</strong> ${new Date(order.Order_date).toLocaleString('vi-VN')}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-close-modal" data-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `

    if (window.$) {
      $('#orderDetailModal').remove()
      $('body').append(modalHtml)
      $('#orderDetailModal').modal('show')
    }
  } catch (e) {
    console.error(e)
    alert('Lỗi khi tải chi tiết đơn hàng')
  }
}

window.updateStatus = async function (id, status) {
  const res = await API.put(`/orders/${id}`, { status })
  if (res.success) {
    if (window.showToast) window.showToast(`Đã cập nhật đơn #${id} → ${status}`)
    renderAdminOrders()
    renderAdminCustomers()
  } else {
    alert('Lỗi: ' + (res.message || 'Không thể cập nhật'))
    renderAdminOrders()
  }
}

window.deleteItem = async (type, id) => {
  if (!confirm('Bạn chắc chắn muốn xóa?')) return
  const res = await API.del(`/${type}/${id}`)
  if (res.success) {
    if (window.showToast) window.showToast(res.message || 'Đã xóa!')
    if (type === 'menu') renderAdminMenu()
    if (type === 'vouchers') renderAdminVouchers()
    if (type === 'customers') renderAdminCustomers()
    if (type === 'orders') renderAdminOrders()
    if (type === 'feedback') renderAdminFeedbacks()
  } else {
    alert(res.message || 'Lỗi khi xóa')
  }
}

window.resetDemoData = async () => {
  if (!confirm('Khôi phục toàn bộ dữ liệu gốc của ANTT Coffee?')) return
  const res = await API.post('/reset', {})
  if (res.success) {
    if (window.showToast) window.showToast(res.message)
    renderAdminMenu()
    renderAdminOrders()
    renderAdminVouchers()
    renderAdminCustomers()
    renderAdminFeedbacks()
  }
}

function guardAdmin() {
  let u = null
  try {
    u = JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    u = null
  }
  const role = u && (u.Role || u.role) ? String(u.Role || u.role).toLowerCase() : ''
  if (role !== 'admin') {
    window.location.href = 'login.html'
    return false
  }
  return true
}

window.logout = () => {
  localStorage.removeItem('currentUser')
  window.location.href = 'login.html'
}
