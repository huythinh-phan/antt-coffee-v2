import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  listMenu,
  findProductById,
  upsertProduct,
  removeProduct,
  listVouchers,
  upsertVoucher,
  removeVoucher,
  calcVoucherDiscount,
  createOrderRecord,
  listUserOrders,
  listAllOrders,
  findOrderDetails,
  changeOrderStatus,
  removeOrder,
  registerAccount,
  authenticateUser,
  resetAccountPassword,
  listCustomers,
  upsertCustomer,
  removeCustomer,
  listFeedbacks,
  addFeedback,
  removeFeedback,
  resetStore,
} from '../db/store.js'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_IMAGES_DIR = path.resolve(__dirname, '../../public/images')

// Dùng memoryStorage để vừa lưu được ra đĩa khi chạy local, vừa chuyển sang Data URL khi chạy trên Vercel (read-only fs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
})

function resolveUploadedImage(file) {
  if (!file || !file.buffer) return null
  const safeName = `${Date.now()}-${String(file.originalname || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')}`
  try {
    if (!process.env.VERCEL && fs.existsSync(PUBLIC_IMAGES_DIR)) {
      const target = path.join(PUBLIC_IMAGES_DIR, safeName)
      fs.writeFileSync(target, file.buffer)
      return `/images/${safeName}`
    }
  } catch {
    /* fallback to base64 data URL */
  }
  const mime = file.mimetype || 'image/jpeg'
  return `data:${mime};base64,${file.buffer.toString('base64')}`
}

// === HEALTH & RESET ===
router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', time: Date.now() })
})

router.post('/reset', (_req, res) => {
  resetStore()
  res.json({ success: true, message: 'Đã khôi phục dữ liệu gốc của ANTT Coffee' })
})

// === PRODUCT / MENU API ===
router.get('/menu', (req, res) => {
  const includeInactive = req.query.all === '1'
  res.json({ success: true, data: listMenu({ includeInactive }) })
})

router.get('/product/:id', (req, res) => {
  const product = findProductById(req.params.id)
  if (!product) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' })
  }
  if (Number(product.Is_active) === 0) {
    return res.json({ success: false, data: product, message: 'Món này đã ngừng kinh doanh' })
  }
  res.json({ success: true, data: product })
})

router.post('/menu', upload.single('image'), (req, res) => {
  const { id, pid, name, price, cate_id, description, currentImage } = req.body || {}
  const uploaded = resolveUploadedImage(req.file)
  const imagePath = uploaded || (currentImage && currentImage !== 'undefined' ? currentImage : null)
  const r = upsertProduct({
    id: id || pid || null,
    name,
    price,
    cate_id,
    description,
    imagePath,
  })
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, data: r.item, message: 'Lưu món thành công' })
})

router.delete('/menu/:id', (req, res) => {
  const r = removeProduct(req.params.id)
  if (!r.ok) return res.status(404).json({ success: false, message: r.message })
  res.json({ success: true, softDeleted: r.softDeleted, message: r.message })
})

// === VOUCHER API ===
router.get('/vouchers', (_req, res) => {
  res.json({ success: true, data: listVouchers() })
})

router.post('/vouchers/validate', (req, res) => {
  const { code, subtotal } = req.body || {}
  const cleanCode = String(code || '').trim().toUpperCase()
  const v = listVouchers().find((x) => String(x.Voucher_code).toUpperCase() === cleanCode)
  if (!v) return res.status(404).json({ success: false, valid: false, discount: 0, message: 'Mã không hợp lệ' })
  const calc = calcVoucherDiscount(v, Number(subtotal) || 0)
  res.json({ success: calc.valid, ...calc, voucher: v })
})

router.post('/vouchers', (req, res) => {
  const r = upsertVoucher(req.body || {})
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message, data: r.voucher })
})

router.delete('/vouchers/:id', (req, res) => {
  const r = removeVoucher(req.params.id)
  if (!r.ok) return res.status(404).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message })
})

// === ORDER API ===
router.post('/orders', (req, res) => {
  const r = createOrderRecord(req.body || {})
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message, data: r.order })
})

router.get('/orders', (_req, res) => {
  res.json({ success: true, data: listAllOrders() })
})

router.get('/orders/user/:userId', (req, res) => {
  res.json({ success: true, data: listUserOrders(req.params.userId) })
})

router.get('/orders/:id/details', (req, res) => {
  const detail = findOrderDetails(req.params.id)
  if (!detail) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
  res.json({ success: true, data: detail })
})

router.put('/orders/:id', (req, res) => {
  const { status } = req.body || {}
  if (!status) return res.status(400).json({ success: false, message: 'Thiếu trạng thái mới' })
  const r = changeOrderStatus(req.params.id, status)
  if (!r.ok) return res.status(404).json({ success: false, message: r.message })
  res.json({ success: true, data: r.order, message: 'Cập nhật trạng thái thành công' })
})

router.delete('/orders/:id', (req, res) => {
  const r = removeOrder(req.params.id)
  if (!r.ok) return res.status(404).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message })
})

// === AUTH API ===
router.post('/register', (req, res) => {
  const r = registerAccount(req.body || {})
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message, user: r.user })
})

router.post('/login', (req, res) => {
  const user = authenticateUser(req.body || {})
  if (!user) return res.status(401).json({ success: false, error: 'Sai thông tin đăng nhập', message: 'Sai thông tin đăng nhập' })
  res.json({ success: true, user })
})

router.post('/reset-password', (req, res) => {
  const r = resetAccountPassword(req.body || {})
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message })
})

// === CUSTOMER API ===
router.get('/customers', (_req, res) => {
  res.json({ success: true, data: listCustomers() })
})

router.post('/customers', (req, res) => {
  const r = upsertCustomer(req.body || {})
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message })
})

router.delete('/customers/:id', (req, res) => {
  const r = removeCustomer(req.params.id)
  res.json({ success: true, message: r.message })
})

// === FEEDBACK API ===
router.get('/feedback', (_req, res) => {
  res.json({ success: true, data: listFeedbacks() })
})

router.post('/feedback', upload.single('image'), (req, res) => {
  const imagePath = resolveUploadedImage(req.file)
  const r = addFeedback({ ...(req.body || {}), imagePath })
  if (!r.ok) return res.status(400).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message, data: r.feedback })
})

router.delete('/feedback/:id', (req, res) => {
  const r = removeFeedback(req.params.id)
  if (!r.ok) return res.status(404).json({ success: false, message: r.message })
  res.json({ success: true, message: r.message })
})

export default router
