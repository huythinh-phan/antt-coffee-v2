// Tự động nhận diện địa chỉ API:
// - Khi chạy trên server HTTP/HTTPS (Express local hoặc Vercel): dùng đường dẫn tương đối '/api'
// - Khi mở trực tiếp bằng file://: trỏ về http://localhost:3000/api
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:'

const API_BASE_URL = isFileProtocol ? 'http://localhost:3000/api' : '/api'
const IMG_BASE_URL = isFileProtocol ? 'http://localhost:3000' : ''

window.showToast = function (message, type = 'success') {
  if (typeof document === 'undefined') return
  let box = document.getElementById('antt-toast-container')
  if (!box) {
    box = document.createElement('div')
    box.id = 'antt-toast-container'
    box.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:360px;'
    document.body.appendChild(box)
  }
  const el = document.createElement('div')
  const bg = type === 'error' ? '#c0392b' : type === 'info' ? '#2c3e50' : '#c49b63'
  const fg = type === 'success' ? '#120f0f' : '#ffffff'
  el.setAttribute('data-testid', 'toast')
  el.style.cssText = `background:${bg};color:${fg};padding:12px 16px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,0.45);font-weight:600;font-size:14px;`
  el.textContent = message
  box.appendChild(el)
  setTimeout(() => {
    el.remove()
  }, 3200)
}

const API = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`)
      return await res.json()
    } catch (e) {
      console.error(`GET ${endpoint} failed`, e)
      return { success: false, message: 'Lỗi kết nối Server' }
    }
  },

  post: async (endpoint, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await res.json()
    } catch (e) {
      console.error(`POST ${endpoint} failed`, e)
      return { success: false, message: 'Lỗi kết nối Server' }
    }
  },

  put: async (endpoint, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await res.json()
    } catch (e) {
      console.error(`PUT ${endpoint} failed`, e)
      return { success: false, message: 'Lỗi kết nối Server' }
    }
  },

  del: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' })
      return await res.json()
    } catch (e) {
      console.error(`DELETE ${endpoint} failed`, e)
      return { success: false, message: 'Lỗi kết nối Server' }
    }
  },

  upload: async (endpoint, formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      })
      return await res.json()
    } catch (e) {
      console.error(`UPLOAD ${endpoint} failed`, e)
      return { success: false, message: 'Lỗi kết nối Server' }
    }
  },

  fixImg: (path) => {
    if (!path || path === 'undefined' || path === 'null') return 'images/menu-1.jpg'
    if (path.startsWith('http') || path.startsWith('data:')) return path
    if (path.startsWith('/')) return `${IMG_BASE_URL}${path}`
    return path
  },

  vnd: (price) => (Number.parseInt(price, 10) || 0).toLocaleString('vi-VN') + ' đ',
}

window.API = API
