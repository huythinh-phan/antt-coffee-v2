document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('gallery-container')
  if (!container) return

  const res = await API.get('/feedback')
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    container.innerHTML = res.data
      .map((f) => {
        const imgUrl = API.fixImg(f.Image || 'images/gallery-1.jpg')

        return `
        <div class="col-md-4 mb-4 ftco-animate fadeInUp ftco-animated" data-testid="gallery-card">
          <div class="blog-entry align-self-stretch" style="background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;">
            <a href="${imgUrl}" class="block-20 image-popup"
               style="background-image: url('${imgUrl}'); height: 250px;">
            </a>
            <div class="text py-4 d-block text-center px-3">
              <div class="meta">
                <div><span class="icon-user"></span> ${f.Full_name || 'Khách hàng'}</div>
                <div><span class="icon-star text-warning"></span> ${f.Rating}/5</div>
              </div>
              <h3 class="heading mt-2"><a href="#">${f.Dish_name || 'Review món ngon'}</a></h3>
              <p class="text-white-50">"${f.Content || ''}"</p>
            </div>
          </div>
        </div>`
      })
      .join('')

    if (window.$ && $('.image-popup').length > 0 && $.fn.magnificPopup) {
      $('.image-popup').magnificPopup({ type: 'image', gallery: { enabled: true } })
    }
  } else {
    container.innerHTML = '<p class="text-center text-white w-100">Chưa có hình ảnh nào từ khách hàng.</p>'
  }
})
