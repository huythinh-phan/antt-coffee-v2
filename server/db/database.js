import dotenv from 'dotenv'

dotenv.config()

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_coffee_shop',
  port: Number.parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool = null

/**
 * Kết nối MySQL (XAMPP) tuỳ chọn khi USE_MYSQL=true.
 * Nếu không bật XAMPP hoặc chạy trên Vercel, hệ thống tự động dùng Embedded Store (seed từ db.sql).
 */
export async function getMysqlPool() {
  if (process.env.USE_MYSQL !== 'true') return null
  if (pool) return pool
  try {
    const mysql = await import('mysql2/promise')
    pool = mysql.default.createPool(dbConfig)
    const conn = await pool.getConnection()
    conn.release()
    return pool
  } catch (e) {
    console.warn('[DB] Không kết nối được MySQL, tự động dùng Embedded Store:', e.message)
    pool = null
    return null
  }
}
