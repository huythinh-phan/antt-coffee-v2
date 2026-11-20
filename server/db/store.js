import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createInitialStore, computeLevel } from './seedData.js'
import { pointsFor } from '../../src/lib/loyalty.js'

const DATA_FILE = process.env.STORE_FILE || path.join(os.tmpdir(), 'antt_coffee_v3_store.json')

let memStore = null

function loadStore() {
  if (memStore) return memStore
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.items)) {
        memStore = parsed
        return memStore
      }
    }
  } catch {
    /* fallback to initial seed */
  }
  memStore = createInitialStore()
  saveStore(memStore)
  return memStore
}

function saveStore(store = memStore) {
  if (!store) return
  memStore = store
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store), 'utf8')
  } catch {
    /* ignore read-only fs errors */
  }
}

export function resetStore() {
  memStore = createInitialStore()
  saveStore(memStore)
  return memStore
}

export function getStore() {
  return loadStore()
}

export function persistStore() {
  saveStore(memStore)
}

const nextId = (arr, key) => arr.reduce((m, x) => Math.max(m, Number(x[key]) || 0), 0) + 1
const nowStr = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

export function isPercentVoucher(v) {
  const d = String(v?.Description || '').toLowerCase()
  return d.includes('percent') || d === 'percentage'
}

export function calcVoucherDiscount(voucher, subtotal) {
  if (!voucher || subtotal <= 0) return { valid: false, discount: 0, message: 'Mã không hợp lệ' }
  const minVal = Number(voucher.Min_order_val) || 0
  if (subtotal < minVal) {
    return { valid: false, discount: 0, message: `Đơn tối thiểu ${minVal.toLocaleString('vi-VN')} đ` }
  }
  const val = Number(voucher.Value) || 0
  let discount = isPercentVoucher(voucher) ? Math.round((subtotal * val) / 100) : val
  if (discount > subtotal) discount = subtotal
  return { valid: true, discount, message: `Đã giảm ${discount.toLocaleString('vi-VN')} đ` }
}

function splitFullName(fullname = '') {
  const parts = String(fullname || '').trim().split(/\s+/).filter(Boolean)
  const lname = parts.pop() || ''
  const fname = parts.join(' ')
  return { fname, lname }
}

/** Đảm bảo tài khoản có hồ sơ trong bảng customer. */
export function ensureCustomerProfile(accId) {
  const s = loadStore()
  let cus = s.customers.find((c) => Number(c.Acc_id) === Number(accId))
  if (!cus) {
    const acc = s.accounts.find((a) => Number(a.Acc_id) === Number(accId))
    const { fname, lname } = splitFullName(acc?.Full_name || acc?.Username || 'Khách')
    cus = {
      Cus_id: nextId(s.customers, 'Cus_id'),
      F_name: fname,
      L_name: lname,
      Phone: '',
      Points: 0,
      Acc_id: Number(accId),
      Address: '',
      Level: computeLevel(0),
    }
    s.customers.push(cus)
    saveStore()
  }
  return cus
}

// ==================== MENU / PRODUCT ====================
export function listMenu({ includeInactive = false } = {}) {
  const s = loadStore()
  const catMap = Object.fromEntries(s.categories.map((c) => [Number(c.Cate_id), c.Cate_name]))
  return s.items
    .filter((i) => includeInactive || Number(i.Is_active) === 1)
    .map((i) => ({
      ...i,
      Price: Number(i.Price),
      category: catMap[Number(i.Cate_id)] || 'Cà phê',
    }))
}

export function findProductById(id) {
  const s = loadStore()
  const catMap = Object.fromEntries(s.categories.map((c) => [Number(c.Cate_id), c.Cate_name]))
  const item = s.items.find((i) => Number(i.Item_id) === Number(id))
  if (!item) return null
  return {
    ...item,
    Price: Number(item.Price),
    category: catMap[Number(item.Cate_id)] || 'Cà phê',
  }
}

export function upsertProduct({ id, name, price, cate_id, description, imagePath }) {
  const s = loadStore()
  const cleanName = String(name || '').trim()
  const cleanPrice = Number(price)
  if (!cleanName) return { ok: false, message: 'Tên món không được để trống' }
  if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) return { ok: false, message: 'Giá món phải lớn hơn 0' }
  const safeCate = Number(cate_id) || 1

  if (id) {
    const idx = s.items.findIndex((i) => Number(i.Item_id) === Number(id))
    if (idx < 0) return { ok: false, message: 'Không tìm thấy món ăn' }
    const cur = s.items[idx]
    s.items[idx] = {
      ...cur,
      Item_name: cleanName,
      Price: cleanPrice,
      Cate_id: safeCate,
      Description: description != null ? String(description) : cur.Description,
      Image: imagePath || cur.Image || 'images/menu-1.jpg',
      Is_active: 1,
    }
    saveStore()
    return { ok: true, item: s.items[idx] }
  }

  const newItem = {
    Item_id: nextId(s.items, 'Item_id'),
    Item_name: cleanName,
    Description: String(description || ''),
    Image: imagePath || 'images/menu-1.jpg',
    Is_active: 1,
    Cate_id: safeCate,
    Price: cleanPrice,
  }
  s.items.push(newItem)
  saveStore()
  return { ok: true, item: newItem }
}

export function removeProduct(id) {
  const s = loadStore()
  const idx = s.items.findIndex((i) => Number(i.Item_id) === Number(id))
  if (idx < 0) return { ok: false, message: 'Không tìm thấy món ăn' }
  const usedInOrders = s.details.some((d) => Number(d.Item_id) === Number(id))
  if (usedInOrders) {
    // Soft delete để giữ lịch sử đơn hàng cũ mà món vẫn biến mất khỏi thực đơn đang bán
    s.items[idx] = { ...s.items[idx], Is_active: 0 }
    saveStore()
    return { ok: true, softDeleted: true, message: 'Đã ẩn món ăn khỏi thực đơn (giữ lịch sử đơn cũ)' }
  }
  s.items.splice(idx, 1)
  saveStore()
  return { ok: true, softDeleted: false, message: 'Đã xóa món ăn' }
}

// ==================== VOUCHERS ====================
export function listVouchers() {
  const s = loadStore()
  const now = new Date()
  return s.vouchers.filter((v) => !v.Date_end || new Date(v.Date_end) > now)
}

export function upsertVoucher({ id, code, value, min, name, type }) {
  const s = loadStore()
  const cleanCode = String(code || '').trim().toUpperCase()
  const cleanVal = Number(value)
  const cleanMin = Number(min) || 0
  const cleanType = String(type || 'amount').toLowerCase().includes('percent') ? 'percent' : 'amount'

  if (!cleanCode || cleanCode.length < 3) return { ok: false, message: 'Mã voucher phải từ 3 ký tự' }
  if (!Number.isFinite(cleanVal) || cleanVal <= 0) return { ok: false, message: 'Giá trị giảm phải lớn hơn 0' }
  if (cleanType === 'percent' && cleanVal > 100) return { ok: false, message: 'Phần trăm giảm tối đa 100%' }

  const dup = s.vouchers.find((v) => String(v.Voucher_code).toUpperCase() === cleanCode && Number(v.Voucher_id) !== Number(id || 0))
  if (dup) return { ok: false, message: 'Mã voucher đã tồn tại' }

  if (id) {
    const idx = s.vouchers.findIndex((v) => Number(v.Voucher_id) === Number(id))
    if (idx < 0) return { ok: false, message: 'Không tìm thấy voucher' }
    s.vouchers[idx] = {
      ...s.vouchers[idx],
      Voucher_code: cleanCode,
      Voucher_name: name || `Mã ${cleanCode}`,
      Value: cleanVal,
      Min_order_val: cleanMin,
      Description: cleanType,
    }
    saveStore()
    return { ok: true, message: 'Cập nhật voucher thành công', voucher: s.vouchers[idx] }
  }

  const endDate = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
  const newV = {
    Voucher_id: nextId(s.vouchers, 'Voucher_id'),
    Voucher_code: cleanCode,
    Voucher_name: name || `Mã ${cleanCode}`,
    Value: cleanVal,
    Min_order_val: cleanMin,
    Description: cleanType,
    Quantity: 100,
    Max_usage_per_user: 1,
    Date_start: nowStr(),
    Date_end: endDate,
  }
  s.vouchers.push(newV)
  saveStore()
  return { ok: true, message: 'Tạo voucher thành công', voucher: newV }
}

export function removeVoucher(id) {
  const s = loadStore()
  const idx = s.vouchers.findIndex((v) => Number(v.Voucher_id) === Number(id))
  if (idx < 0) return { ok: false, message: 'Không tìm thấy voucher' }
  s.vouchers.splice(idx, 1)
  saveStore()
  return { ok: true, message: 'Đã xóa voucher' }
}

// ==================== ORDERS ====================
export function createOrderRecord({ userId, items, voucherCode, guestInfo }) {
  const s = loadStore()
  if (!userId && voucherCode) {
    return { ok: false, message: 'Khách vãng lai không thể sử dụng Voucher. Vui lòng đăng nhập!' }
  }
  if (!guestInfo || !String(guestInfo.name || '').trim() || !String(guestInfo.phone || '').trim() || !String(guestInfo.address || '').trim()) {
    return { ok: false, message: 'Vui lòng nhập đầy đủ thông tin giao hàng!' }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: 'Giỏ hàng trống!' }
  }

  // Kiểm tra món và lấy giá chuẩn từ DB (không tin giá từ client nếu tìm được món trong DB)
  const resolvedItems = []
  for (const raw of items) {
    const itemId = Number(raw.id ?? raw.Item_id ?? raw.menuId)
    const qty = Math.max(1, Number(raw.qty ?? raw.Quantity) || 1)
    const dbItem = s.items.find((i) => Number(i.Item_id) === itemId)
    if (!dbItem) {
      return { ok: false, message: 'Một số món không còn tồn tại!' }
    }
    resolvedItems.push({
      Item_id: dbItem.Item_id,
      Quantity: qty,
      Price: Number(dbItem.Price),
    })
  }

  const initAmount = resolvedItems.reduce((sum, i) => sum + i.Price * i.Quantity, 0)
  let voucherId = null
  let discountAmount = 0

  if (userId && voucherCode) {
    const code = String(voucherCode).trim().toUpperCase()
    const v = listVouchers().find((x) => String(x.Voucher_code).toUpperCase() === code)
    if (v) {
      const calc = calcVoucherDiscount(v, initAmount)
      if (calc.valid) {
        voucherId = v.Voucher_id
        discountAmount = calc.discount
        if (typeof v.Quantity === 'number' && v.Quantity > 0) v.Quantity -= 1
      }
    }
  }

  const totalAmount = Math.max(0, initAmount - discountAmount)
  const orderId = nextId(s.orders, 'Order_id')
  const newOrder = {
    Order_id: orderId,
    Order_date: nowStr(),
    Init_amount: initAmount,
    Discount_amount: discountAmount,
    Total_amount: totalAmount,
    Status: 'CREATED',
    Payment_method: 'Cash',
    Cus_id: userId ? Number(userId) : null,
    Staff_id: null,
    Voucher_id: voucherId,
    Shipping_Name: String(guestInfo.name).trim(),
    Shipping_Phone: String(guestInfo.phone).trim(),
    Shipping_Address: String(guestInfo.address).trim(),
    Points_awarded: 0,
  }
  s.orders.unshift(newOrder)

  let detailId = nextId(s.details, 'Detail_id')
  for (const line of resolvedItems) {
    s.details.push({
      Detail_id: detailId++,
      Order_id: orderId,
      Item_id: line.Item_id,
      Quantity: line.Quantity,
      Price: line.Price,
    })
  }

  saveStore()
  return { ok: true, order: newOrder, message: 'Đặt hàng thành công' }
}

export function listUserOrders(userId) {
  const s = loadStore()
  const itemMap = Object.fromEntries(s.items.map((i) => [Number(i.Item_id), i]))
  // Trong db.sql, Order.Cus_id lưu Acc_id của user (VD: user Acc_id=2 có các đơn Cus_id=2)
  // Đồng thời kiểm tra cả Cus_id trong bảng customer để tương thích 2 chiều.
  const cusRow = s.customers.find((c) => Number(c.Acc_id) === Number(userId))
  const matchIds = new Set([Number(userId)])
  if (cusRow) matchIds.add(Number(cusRow.Acc_id))

  return s.orders
    .filter((o) => o.Cus_id != null && matchIds.has(Number(o.Cus_id)))
    .sort((a, b) => Number(b.Order_id) - Number(a.Order_id))
    .map((o) => {
      const items = s.details
        .filter((d) => Number(d.Order_id) === Number(o.Order_id))
        .map((d) => {
          const it = itemMap[Number(d.Item_id)]
          return {
            Item_id: d.Item_id,
            qty: d.Quantity,
            price: Number(d.Price),
            name: it?.Item_name || 'Món đã ẩn',
            image: it?.Image || 'images/menu-1.jpg',
          }
        })
      return { ...o, items }
    })
}

export function listAllOrders() {
  const s = loadStore()
  const accMap = Object.fromEntries(s.accounts.map((a) => [Number(a.Acc_id), a]))
  return [...s.orders]
    .sort((a, b) => Number(b.Order_id) - Number(a.Order_id))
    .map((o) => {
      const acc = o.Cus_id != null ? accMap[Number(o.Cus_id)] : null
      return {
        ...o,
        Full_name: acc?.Full_name || o.Shipping_Name || 'Khách vãng lai',
        Username: acc?.Username || null,
      }
    })
}

export function findOrderDetails(orderId) {
  const s = loadStore()
  const o = s.orders.find((x) => Number(x.Order_id) === Number(orderId))
  if (!o) return null
  const acc = o.Cus_id != null ? s.accounts.find((a) => Number(a.Acc_id) === Number(o.Cus_id)) : null
  const v = o.Voucher_id != null ? s.vouchers.find((x) => Number(x.Voucher_id) === Number(o.Voucher_id)) : null
  const itemMap = Object.fromEntries(s.items.map((i) => [Number(i.Item_id), i]))

  const info = {
    ...o,
    CusName: acc?.Full_name || o.Shipping_Name || 'Khách vãng lai',
    Full_name: acc?.Full_name || o.Shipping_Name || 'Khách vãng lai',
    Username: acc?.Username || null,
    Voucher_code: v?.Voucher_code || null,
    VoucherVal: v?.Value || null,
    VoucherType: v?.Description || null,
  }
  const items = s.details
    .filter((d) => Number(d.Order_id) === Number(o.Order_id))
    .map((d) => {
      const it = itemMap[Number(d.Item_id)]
      return {
        ...d,
        Item_name: it?.Item_name || 'Món đã ẩn',
        Image: it?.Image || 'images/menu-1.jpg',
      }
    })
  return { info, items }
}

export function changeOrderStatus(orderId, newStatus) {
  const s = loadStore()
  const idx = s.orders.findIndex((o) => Number(o.Order_id) === Number(orderId))
  if (idx < 0) return { ok: false, message: 'Không tìm thấy đơn hàng' }
  const order = s.orders[idx]
  order.Status = newStatus

  // Cộng điểm tích luỹ khi đơn chuyển sang Completed (1 điểm / 10.000đ, chỉ cộng 1 lần)
  if ((newStatus === 'Completed' || newStatus === 'FULFILLED') && !order.Points_awarded && order.Cus_id != null) {
    const earned = pointsFor(Number(order.Total_amount) || 0)
    if (earned > 0) {
      const cus = ensureCustomerProfile(order.Cus_id)
      cus.Points = (Number(cus.Points) || 0) + earned
      cus.Level = computeLevel(cus.Points)
      order.Points_awarded = earned
    }
  }
  saveStore()
  return { ok: true, order }
}

export function removeOrder(orderId) {
  const s = loadStore()
  const idx = s.orders.findIndex((o) => Number(o.Order_id) === Number(orderId))
  if (idx < 0) return { ok: false, message: 'Không tìm thấy đơn hàng' }
  s.details = s.details.filter((d) => Number(d.Order_id) !== Number(orderId))
  s.orders.splice(idx, 1)
  saveStore()
  return { ok: true, message: 'Đã xóa đơn hàng' }
}

// ==================== AUTH ====================
export function registerAccount({ username, password, email, fullname }) {
  const s = loadStore()
  const cleanUser = String(username || '').trim()
  const cleanEmail = String(email || `${cleanUser}@antt.com`).trim()
  const cleanName = String(fullname || cleanUser).trim()
  const cleanPass = String(password || '')

  if (cleanUser.length < 3) return { ok: false, message: 'Tên đăng nhập phải từ 3 ký tự' }
  if (cleanPass.length < 6) return { ok: false, message: 'Mật khẩu phải từ 6 ký tự' }

  const dup = s.accounts.find((a) => a.Username.toLowerCase() === cleanUser.toLowerCase())
  if (dup) return { ok: false, message: 'Tên đăng nhập đã tồn tại' }

  const newAcc = {
    Acc_id: nextId(s.accounts, 'Acc_id'),
    Username: cleanUser,
    Password: cleanPass,
    Email: cleanEmail,
    Full_name: cleanName,
    Role: 'Customer',
    Join_date: nowStr(),
  }
  s.accounts.push(newAcc)
  ensureCustomerProfile(newAcc.Acc_id)
  saveStore()
  return { ok: true, user: newAcc, message: 'Đăng ký thành công' }
}

export function authenticateUser({ username, password }) {
  const s = loadStore()
  const u = String(username || '').trim().toLowerCase()
  const p = String(password ?? '')

  // Hỗ trợ cả tài khoản trong db.sql (admin/admin123, user/123456) lẫn alias demo (admin/admin, khach/123)
  let acc = s.accounts.find((a) => a.Username.toLowerCase() === u && a.Password === p)
  if (!acc && u === 'admin' && p === 'admin') {
    acc = s.accounts.find((a) => a.Username.toLowerCase() === 'admin')
  }
  if (!acc && u === 'khach' && p === '123') {
    acc = s.accounts.find((a) => a.Username.toLowerCase() === 'user')
  }
  if (!acc) return null
  return {
    Acc_id: acc.Acc_id,
    Username: acc.Username,
    Role: acc.Role,
    Full_name: acc.Full_name,
    Email: acc.Email,
  }
}

export function resetAccountPassword({ email, username, newPassword }) {
  const s = loadStore()
  const u = String(username || '').trim().toLowerCase()
  const em = String(email || '').trim().toLowerCase()
  const acc = s.accounts.find((a) => a.Username.toLowerCase() === u && a.Email.toLowerCase() === em)
  if (!acc) return { ok: false, message: 'Thông tin Email hoặc Tên đăng nhập không chính xác.' }
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, message: 'Mật khẩu mới phải từ 6 ký tự.' }
  }
  acc.Password = String(newPassword)
  saveStore()
  return { ok: true, message: 'Đặt lại mật khẩu thành công!' }
}

// ==================== CUSTOMERS ====================
export function listCustomers() {
  const s = loadStore()
  return s.accounts
    .filter((a) => String(a.Role).toLowerCase() !== 'admin')
    .sort((a, b) => Number(b.Acc_id) - Number(a.Acc_id))
    .map((a) => {
      const c = s.customers.find((x) => Number(x.Acc_id) === Number(a.Acc_id))
      const pts = Number(c?.Points) || 0
      return {
        Acc_id: a.Acc_id,
        Username: a.Username,
        Full_name: a.Full_name,
        Email: a.Email,
        Cus_id: c?.Cus_id || null,
        Phone: c?.Phone || '',
        Address: c?.Address || '',
        Points: pts,
        Level: computeLevel(pts),
      }
    })
}

export function upsertCustomer({ acc_id, fullname, email, phone, address, points, username, password }) {
  const s = loadStore()
  const safePhone = String(phone || '').trim()
  const safeAddress = String(address || '').trim()
  const safePoints = Math.max(0, Number(points) || 0)

  if (acc_id) {
    const acc = s.accounts.find((a) => Number(a.Acc_id) === Number(acc_id))
    if (!acc) return { ok: false, message: 'Không tìm thấy tài khoản' }
    if (fullname) acc.Full_name = String(fullname).trim()
    if (email) acc.Email = String(email).trim()

    const cus = ensureCustomerProfile(acc.Acc_id)
    const { fname, lname } = splitFullName(acc.Full_name)
    cus.F_name = fname
    cus.L_name = lname
    cus.Phone = safePhone
    if (address !== undefined) cus.Address = safeAddress
    if (points !== undefined && points !== '') {
      cus.Points = safePoints
      cus.Level = computeLevel(safePoints)
    }
    saveStore()
    return { ok: true, message: 'Cập nhật khách hàng thành công' }
  }

  if (!username || !password) return { ok: false, message: 'Thiếu username/password' }
  const reg = registerAccount({ username, password, email, fullname })
  if (!reg.ok) return reg
  const cus = ensureCustomerProfile(reg.user.Acc_id)
  cus.Phone = safePhone
  cus.Address = safeAddress
  cus.Points = safePoints
  cus.Level = computeLevel(safePoints)
  saveStore()
  return { ok: true, message: 'Thêm khách hàng mới thành công' }
}

export function removeCustomer(accId) {
  const s = loadStore()
  s.customers = s.customers.filter((c) => Number(c.Acc_id) !== Number(accId))
  s.accounts = s.accounts.filter((a) => Number(a.Acc_id) !== Number(accId))
  saveStore()
  return { ok: true, message: 'Đã xóa khách hàng' }
}

// ==================== FEEDBACK ====================
export function listFeedbacks() {
  const s = loadStore()
  return [...s.feedbacks]
    .sort((a, b) => Number(b.Feedback_id) - Number(a.Feedback_id))
    .map((f) => {
      const cus = s.customers.find((c) => Number(c.Cus_id) === Number(f.Cus_id))
      const acc = cus ? s.accounts.find((a) => Number(a.Acc_id) === Number(cus.Acc_id)) : s.accounts.find((a) => Number(a.Acc_id) === Number(f.Cus_id))
      return {
        ...f,
        F_name: cus?.F_name || '',
        L_name: cus?.L_name || '',
        Full_name: acc?.Full_name || [cus?.F_name, cus?.L_name].filter(Boolean).join(' ') || 'Khách hàng',
      }
    })
}

export function addFeedback({ acc_id, content, rating, dish_name, imagePath }) {
  const s = loadStore()
  if (!acc_id || acc_id === 'undefined') {
    return { ok: false, message: 'Lỗi: Không tìm thấy User ID.' }
  }
  const cus = ensureCustomerProfile(acc_id)
  const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5))
  const newFb = {
    Feedback_id: nextId(s.feedbacks, 'Feedback_id'),
    Cus_id: cus.Cus_id,
    Content: String(content || '').trim(),
    Rating: cleanRating,
    Created_at: nowStr(),
    Image: imagePath || null,
    Dish_name: String(dish_name || '').trim() || 'Đồ uống ANTT',
  }
  s.feedbacks.unshift(newFb)
  saveStore()
  return { ok: true, feedback: newFb, message: 'Cảm ơn bạn đã đánh giá!' }
}

export function removeFeedback(id) {
  const s = loadStore()
  const idx = s.feedbacks.findIndex((f) => Number(f.Feedback_id) === Number(id))
  if (idx < 0) return { ok: false, message: 'Không tìm thấy đánh giá' }
  s.feedbacks.splice(idx, 1)
  saveStore()
  return { ok: true, message: 'Đã xóa đánh giá' }
}
