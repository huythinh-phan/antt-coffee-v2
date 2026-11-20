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

  try {
    const res = await API.get('/customers')
    if (res.success && Array.isArray(res.data)) {
      const myProfile = res.data.find((c) => Number(c.Acc_id) === Number(user.Acc_id))
      if (myProfile) {
        document.getElementById('fullname').value = myProfile.Full_name || ''
        document.getElementById('email').value = myProfile.Email || ''
        document.getElementById('phone').value = myProfile.Phone || ''
        document.getElementById('address').value = myProfile.Address || ''
        document.getElementById('points').value = `${myProfile.Points || 0} (${myProfile.Level || 'Bronze'})`
        document.getElementById('points').dataset.rawPoints = String(myProfile.Points || 0)
      } else {
        document.getElementById('fullname').value = user.Full_name || ''
        document.getElementById('email').value = user.Email || user.Username + '@antt.com'
        document.getElementById('points').value = '0 (Bronze)'
        document.getElementById('points').dataset.rawPoints = '0'
      }
    }
  } catch (e) {
    console.error(e)
  }

  const form = document.getElementById('profileForm')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const data = {
        acc_id: user.Acc_id,
        fullname: document.getElementById('fullname').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        points: Number(document.getElementById('points').dataset.rawPoints || 0),
      }

      const updateRes = await API.post('/customers', data)
      if (updateRes.success) {
        user.Full_name = data.fullname
        localStorage.setItem('currentUser', JSON.stringify(user))
        if (window.showToast) window.showToast('Cập nhật hồ sơ thành công!')
        else alert('Cập nhật thành công!')
      } else {
        alert(updateRes.message || 'Lỗi cập nhật')
      }
    })
  }
})
