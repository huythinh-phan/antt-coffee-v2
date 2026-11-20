let allProducts = []

document.addEventListener('DOMContentLoaded', async () => {
  const res = await API.get('/menu')
  if (!res.success) return

  allProducts = res.data || []
  renderMenu(allProducts)

  const searchInput = document.getElementById('searchInput')
  const searchBtn = document.getElementById('searchBtn')

  const doSearch = () => {
    const keyword = (searchInput?.value || '').toLowerCase().trim()
    if (!keyword) {
      renderMenu(allProducts)
      return
    }
    const filtered = allProducts.filter((p) => p.Item_name.toLowerCase().includes(keyword))
    renderMenu(filtered, true)
    if (window.$) {
      $('.nav-pills a').removeClass('active')
      $('.tab-pane').addClass('show active')
    }
  }

  if (searchBtn) searchBtn.addEventListener('click', doSearch)
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') doSearch()
    })
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) renderMenu(allProducts)
    })
  }
})

function renderMenu(products, isSearching = false) {
  const tabs = {
    'cà phê': document.querySelector('#v-pills-0 .row'),
    'trà': document.querySelector('#v-pills-1 .row'),
    'món ăn': document.querySelector('#v-pills-2 .row'),
    'tráng miệng': document.querySelector('#v-pills-3 .row'),
  }
  Object.values(tabs).forEach((el) => {
    if (el) el.innerHTML = ''
  })

  if (products.length === 0 && tabs['cà phê']) {
    tabs['cà phê'].innerHTML = '<div class="col-12 text-center text-white py-4" data-testid="menu-empty">Không tìm thấy món ăn phù hợp.</div>'
    return
  }

  products.forEach((p) => {
    const cat = (p.category || 'cà phê').toLowerCase()
    let container = tabs['cà phê']
    if (!isSearching) {
      if (cat.includes('trà') || cat.includes('nước')) container = tabs['trà']
      else if (cat.includes('món') || cat.includes('food')) container = tabs['món ăn']
      else if (cat.includes('tráng') || cat.includes('bánh')) container = tabs['tráng miệng']
    }

    const imgUrl = API.fixImg(p.Image)
    const detailHref = `detail.html?id=${p.Item_id}&name=${encodeURIComponent(p.Item_name)}&price=${p.Price}&img=${encodeURIComponent(imgUrl)}`

    const html = `
      <div class="col-md-3 text-center animate-box fadeInUp animated-fast" data-testid="menu-card" data-name="${p.Item_name}">
        <div class="menu-wrap">
          <a href="${detailHref}" class="menu-img img mb-4" style="background-image: url('${imgUrl}');"></a>
          <div class="text">
            <h3><a href="${detailHref}">${p.Item_name}</a></h3>
            <p class="price"><span>${API.vnd(p.Price)}</span></p>
            <p>
              <button type="button" class="btn btn-primary btn-outline-primary" data-testid="order-add-${p.Item_id}" onclick="addToCartById(${p.Item_id})">
                Thêm vào giỏ
              </button>
            </p>
          </div>
        </div>
      </div>`
    if (container) container.insertAdjacentHTML('beforeend', html)
  })
}

window.addToCartById = (id, qty = 1) => {
  const p = allProducts.find((x) => Number(x.Item_id) === Number(id))
  if (!p) return
  window.addToCart(p.Item_id, p.Item_name, Number(p.Price), API.fixImg(p.Image), qty)
}

window.addToCart = (id, name, price, img, qty = 1) => {
  const addQty = Math.max(1, Number.parseInt(qty, 10) || 1)
  let cart = []
  try {
    cart = JSON.parse(localStorage.getItem('myCart')) || []
  } catch {
    cart = []
  }
  const numId = Number(id) || id
  const item = cart.find((x) => Number(x.id) === Number(numId))

  if (item) item.qty = Math.min(100, (Number(item.qty) || 0) + addQty)
  else cart.push({ id: numId, name, price: Number(price) || 0, img, qty: addQty })

  localStorage.setItem('myCart', JSON.stringify(cart))
  if (window.showToast) window.showToast(`Đã thêm ${name} vào giỏ!`)
  else alert(`Đã thêm ${name} vào giỏ!`)

  if (window.updateCartCount) window.updateCartCount()
}
