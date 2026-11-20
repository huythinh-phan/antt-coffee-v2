import app from './app.js'

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`☕ ANTT Coffee v3 đang chạy tại http://localhost:${PORT}`)
})
