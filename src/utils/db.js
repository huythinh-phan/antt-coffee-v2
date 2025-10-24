const seedData = {
    users: [
        { id: 'u-admin', username: 'admin', password: 'admin', role: 'admin', name: 'Quản trị' },
        { id: 'u-kh', username: 'khach', password: '123', role: 'customer', name: 'Khách hàng' }
    ],
    menu: [
        { id: 'm1', name: 'Espresso', price: 35000, category: 'Cà phê' },
        { id: 'm2', name: 'Latte', price: 45000, category: 'Cà phê' },
        { id: 'm3', name: 'Cappuccino', price: 48000, category: 'Cà phê' },
        { id: 'm4', name: 'Trà đào', price: 42000, category: 'Trà' },
        { id: 'm5', name: 'Bạc xỉu', price: 38000, category: 'Cà phê' }
    ],
    promotions: [
        { id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, active: true, desc: 'Giảm 10% cho đơn đầu' },
        { id: 'p2', code: 'CF15K', type: 'amount', value: 15000, active: true, desc: 'Giảm 15K cho đồ uống cà phê' }
    ],
    orders: [],
    loyalty: { 'u-kh': 0 }
}


export const loadDB = () => {
    const raw = localStorage.getItem('coffee_demo_db')
    if (!raw) { localStorage.setItem('coffee_demo_db', JSON.stringify(seedData)); return structuredClone(seedData) }
    try { return JSON.parse(raw) } catch { localStorage.setItem('coffee_demo_db', JSON.stringify(seedData)); return structuredClone(seedData) }
}
export const saveDB = (db) => localStorage.setItem('coffee_demo_db', JSON.stringify(db))