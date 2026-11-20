// Dữ liệu gốc 100% từ backend/src/models/db.sql của nhóm ANTT Coffee (my_coffee_shop)
// Kèm công thức tính hạng thành viên (Level) như cột GENERATED ALWAYS trong MySQL.

export function computeLevel(points = 0) {
  const p = Number(points) || 0
  if (p < 200) return 'Bronze'
  if (p < 500) return 'Silver'
  if (p < 1000) return 'Gold'
  return 'Diamond'
}

export function createInitialStore() {
  const futureEnd = '2027-12-31 23:59:59'
  const accounts = [
    { Acc_id: 1, Email: 'admin@antt.com', Username: 'admin', Password: 'admin123', Full_name: 'Quản Trị Viên', Role: 'Admin', Join_date: '2025-12-10 15:46:01' },
    { Acc_id: 2, Email: 'user@antt.com', Username: 'user', Password: '123456', Full_name: 'Ú Ẻ', Role: 'Customer', Join_date: '2025-12-10 15:46:01' },
    { Acc_id: 3, Email: 'a@a.com', Username: 'aaa', Password: '123456', Full_name: 'aaaaa', Role: 'Customer', Join_date: '2025-12-10 15:48:07' },
    { Acc_id: 5, Email: 'c@c.com', Username: 'ccc', Password: '123456', Full_name: 'ccccc', Role: 'Customer', Join_date: '2025-12-11 08:45:00' },
    { Acc_id: 6, Email: 'b@b.com', Username: 'bbb', Password: '123456', Full_name: 'bbbbb', Role: 'Customer', Join_date: '2025-12-11 09:20:12' },
  ]

  const categories = [
    { Cate_id: 1, Cate_name: 'Cà phê' },
    { Cate_id: 2, Cate_name: 'Trà' },
    { Cate_id: 3, Cate_name: 'Món ăn' },
    { Cate_id: 4, Cate_name: 'Bánh' },
  ]

  const customers = [
    { Cus_id: 3, F_name: '', L_name: 'ccccc', Phone: '0123456789', Points: 600, Acc_id: 5, Address: 'Thủ Đức, TP. Hồ Chí Minh' },
    { Cus_id: 4, F_name: 'Ú', L_name: 'Ẻ', Phone: '0234567891', Points: 220, Acc_id: 2, Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Cus_id: 5, F_name: '', L_name: 'bbbbb', Phone: '0111222333', Points: 0, Acc_id: 6, Address: '1, abc, phường ABC, thành phố abcd, tỉnh ABCD' },
    { Cus_id: 6, F_name: '', L_name: 'aaaaa', Phone: '0909123456', Points: 50, Acc_id: 3, Address: 'Quận 1, TP. Hồ Chí Minh' },
  ].map((c) => ({ ...c, Level: computeLevel(c.Points) }))

  const items = [
    { Item_id: 1, Item_name: 'Cà phê Đen Đá', Description: 'Hương vị cà phê Robusta đậm đà, đánh thức mọi giác quan', Image: 'images/menu-1.jpg', Is_active: 1, Cate_id: 1, Price: 25000 },
    { Item_id: 2, Item_name: 'Cà phê Sữa Đá', Description: 'Sự hòa quyện tuyệt vời giữa vị đắng cà phê và vị ngọt của sữa', Image: 'images/menu-2.jpg', Is_active: 1, Cate_id: 1, Price: 29000 },
    { Item_id: 3, Item_name: 'Bạc Xỉu', Description: 'Nhiều sữa, ít cà phê, béo ngậy và thơm lừng', Image: 'images/coffee-1.jpg', Is_active: 1, Cate_id: 1, Price: 32000 },
    { Item_id: 4, Item_name: 'Cappuccino', Description: 'Cà phê Ý đẳng cấp với lớp bọt sữa bồng bềnh', Image: 'images/coffee-2.jpeg', Is_active: 1, Cate_id: 1, Price: 45000 },
    { Item_id: 5, Item_name: 'Trà Đào Cam Sả', Description: 'Thức uống thanh mát, giải nhiệt với đào miếng giòn tan', Image: 'images/menu-3.jpg', Is_active: 1, Cate_id: 2, Price: 39000 },
    { Item_id: 6, Item_name: 'Trà Vải Hoa Hồng', Description: 'Hương thơm hoa hồng tinh tế kết hợp vải thiều mọng nước', Image: 'images/drink-1.jpg', Is_active: 1, Cate_id: 2, Price: 39000 },
    { Item_id: 7, Item_name: 'Trà Sen Vàng', Description: 'Vị trà Oolong đậm đà kết hợp hạt sen bùi bùi và kem béo', Image: 'images/drink-2.jpg', Is_active: 1, Cate_id: 2, Price: 42000 },
    { Item_id: 8, Item_name: 'Nước Ép Cam', Description: 'Cam tươi nguyên chất, bổ sung Vitamin C', Image: 'images/drink-3.jpg', Is_active: 1, Cate_id: 2, Price: 35000 },
    { Item_id: 9, Item_name: 'Matcha Đá Xay', Description: 'Bột Matcha Nhật Bản xay nhuyễn cùng sữa tươi và kem whipping', Image: 'images/drink-4.jpg', Is_active: 1, Cate_id: 3, Price: 49000 },
    { Item_id: 10, Item_name: 'Chocolate Cookie', Description: 'Đá xay sô cô la đậm vị kết hợp vụn bánh quy giòn tan', Image: 'images/drink-5.jpg', Is_active: 1, Cate_id: 3, Price: 52000 },
    { Item_id: 11, Item_name: 'Caramel Freeze', Description: 'Vị caramel ngọt ngào quyện cùng cà phê đá xay mát lạnh', Image: 'images/drink-6.jpg', Is_active: 1, Cate_id: 3, Price: 49000 },
    { Item_id: 12, Item_name: 'Bánh Croissant', Description: 'Bánh sừng trâu ngàn lớp, vỏ giòn ruột mềm thơm mùi bơ', Image: 'images/dessert-1.jpg', Is_active: 1, Cate_id: 4, Price: 30000 },
    { Item_id: 13, Item_name: 'Tiramisu', Description: 'Bánh ngọt tráng miệng vị cà phê và ca cao nổi tiếng của Ý', Image: 'images/dessert-2.jpg', Is_active: 1, Cate_id: 4, Price: 45000 },
    { Item_id: 14, Item_name: 'Mousse Chanh Dây', Description: 'Vị chua ngọt nhẹ nhàng, cốt bánh mềm tan trong miệng', Image: 'images/dessert-3.jpg', Is_active: 1, Cate_id: 4, Price: 39000 },
    { Item_id: 15, Item_name: 'Cheesecake Dâu', Description: 'Bánh phô mai béo ngậy kết hợp sốt dâu tây tươi', Image: 'images/dessert-4.jpg', Is_active: 1, Cate_id: 4, Price: 42000 },
    { Item_id: 16, Item_name: 'Gà nướng nguyên con', Description: 'Gà nướng thơm ngon, suất ăn cho cả gia đình', Image: '/images/1765416601733-dish-4.jpg', Is_active: 1, Cate_id: 3, Price: 75000 },
    { Item_id: 17, Item_name: 'Bánh Mì Kẹp Thịt', Description: 'Bánh mì giòn tan kẹp thịt nướng đậm đà', Image: '/images/1765417904688-burger-1.jpg', Is_active: 1, Cate_id: 3, Price: 40000 },
    { Item_id: 18, Item_name: 'Salad Trộn', Description: 'Rau củ tươi ngon trộn cùng sốt đặc biệt', Image: '/images/1765417925960-dish-7.jpg', Is_active: 1, Cate_id: 3, Price: 35000 },
    { Item_id: 20, Item_name: 'Thịt sườn nướng', Description: 'Thịt sườn nướng thơm phức', Image: '/images/1765417974398-dish-2.jpg', Is_active: 1, Cate_id: 3, Price: 55000 },
  ]

  const vouchers = [
    { Voucher_id: 1, Voucher_name: 'Demo Voucher', Voucher_code: 'TEST10', Description: 'amount', Value: 10000, Min_order_val: 50000, Quantity: 100, Max_usage_per_user: 1, Date_start: '2025-12-10 15:46:01', Date_end: futureEnd },
    { Voucher_id: 2, Voucher_name: 'Mã XMAS10K', Voucher_code: 'XMAS10K', Description: 'percent', Value: 50, Min_order_val: 50000, Quantity: 100, Max_usage_per_user: 1, Date_start: '2025-12-10 00:00:00', Date_end: futureEnd },
    { Voucher_id: 3, Voucher_name: 'Mã NEW50', Voucher_code: 'NEW50', Description: 'amount', Value: 20000, Min_order_val: 40000, Quantity: 100, Max_usage_per_user: 1, Date_start: '2025-12-10 00:00:00', Date_end: futureEnd },
    { Voucher_id: 4, Voucher_name: 'Mã TEST%', Voucher_code: 'TEST%', Description: 'percent', Value: 25, Min_order_val: 30000, Quantity: 100, Max_usage_per_user: 1, Date_start: '2025-12-10 00:00:00', Date_end: futureEnd },
    { Voucher_id: 5, Voucher_name: 'Mã WEEKEND15K', Voucher_code: 'WEEKEND15K', Description: 'amount', Value: 15000, Min_order_val: 40000, Quantity: 100, Max_usage_per_user: 1, Date_start: '2025-12-10 00:00:00', Date_end: futureEnd },
  ]

  const orders = [
    { Order_id: 1, Order_date: '2025-12-10 16:18:06', Init_amount: 74000, Discount_amount: 10000, Total_amount: 64000, Status: 'Processing', Payment_method: 'Cash', Cus_id: 2, Staff_id: null, Voucher_id: 1, Shipping_Name: 'Ú Ẻ', Shipping_Phone: '0234567891', Shipping_Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Order_id: 2, Order_date: '2025-12-10 16:29:47', Init_amount: 100000, Discount_amount: 10000, Total_amount: 90000, Status: 'Completed', Payment_method: 'Cash', Cus_id: 2, Staff_id: null, Voucher_id: 1, Shipping_Name: 'Ú Ẻ', Shipping_Phone: '0234567891', Shipping_Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Order_id: 3, Order_date: '2025-12-11 06:24:18', Init_amount: 200000, Discount_amount: 10000, Total_amount: 190000, Status: 'Cancelled', Payment_method: 'Cash', Cus_id: 3, Staff_id: null, Voucher_id: null, Shipping_Name: 'aaaaa', Shipping_Phone: '0909123456', Shipping_Address: 'Quận 1, TP. Hồ Chí Minh' },
    { Order_id: 5, Order_date: '2025-12-11 08:48:27', Init_amount: 174000, Discount_amount: 0, Total_amount: 174000, Status: 'CREATED', Payment_method: 'Cash', Cus_id: 5, Staff_id: null, Voucher_id: null, Shipping_Name: 'ccccc', Shipping_Phone: '0123456789', Shipping_Address: 'Thủ Đức, TP. Hồ Chí Minh' },
    { Order_id: 6, Order_date: '2025-12-11 08:48:47', Init_amount: 79000, Discount_amount: 50, Total_amount: 78950, Status: 'Completed', Payment_method: 'Cash', Cus_id: 5, Staff_id: null, Voucher_id: null, Shipping_Name: 'ccccc', Shipping_Phone: '0123456789', Shipping_Address: 'Thủ Đức, TP. Hồ Chí Minh' },
    { Order_id: 7, Order_date: '2025-12-11 09:22:35', Init_amount: 95000, Discount_amount: 50, Total_amount: 94950, Status: 'CREATED', Payment_method: 'Cash', Cus_id: 6, Staff_id: null, Voucher_id: null, Shipping_Name: 'bbbbb', Shipping_Phone: '0111222333', Shipping_Address: '1, abc, phường ABC' },
    { Order_id: 8, Order_date: '2025-12-11 09:31:36', Init_amount: 61000, Discount_amount: 15250, Total_amount: 45750, Status: 'CREATED', Payment_method: 'Cash', Cus_id: 2, Staff_id: null, Voucher_id: 4, Shipping_Name: 'Ú Ẻ', Shipping_Phone: '0234567891', Shipping_Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Order_id: 10, Order_date: '2025-12-11 10:18:16', Init_amount: 71000, Discount_amount: 17750, Total_amount: 53250, Status: 'CREATED', Payment_method: 'Cash', Cus_id: 2, Staff_id: null, Voucher_id: 4, Shipping_Name: 'Ú Ẻ', Shipping_Phone: '0234567891', Shipping_Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Order_id: 11, Order_date: '2025-12-11 11:04:08', Init_amount: 120000, Discount_amount: 10000, Total_amount: 110000, Status: 'Completed', Payment_method: 'Cash', Cus_id: 2, Staff_id: null, Voucher_id: 1, Shipping_Name: 'Ú Ẻ', Shipping_Phone: '0234567891', Shipping_Address: 'KTX Khu A, ĐHQG TP.HCM' },
    { Order_id: 13, Order_date: '2025-12-11 14:06:54', Init_amount: 87000, Discount_amount: 43500, Total_amount: 43500, Status: 'CREATED', Payment_method: 'Cash', Cus_id: 6, Staff_id: null, Voucher_id: 2, Shipping_Name: 'bbbbb', Shipping_Phone: '0111222333', Shipping_Address: '1, abc, abcd, abcde' },
    { Order_id: 14, Order_date: '2025-12-11 14:19:05', Init_amount: 32000, Discount_amount: 0, Total_amount: 32000, Status: 'CREATED', Payment_method: 'Cash', Cus_id: null, Staff_id: null, Voucher_id: null, Shipping_Name: 'ttt', Shipping_Phone: '0222333444', Shipping_Address: '1, abc, abcd, abcde' },
    { Order_id: 15, Order_date: '2025-12-11 14:31:41', Init_amount: 32000, Discount_amount: 0, Total_amount: 32000, Status: 'CREATED', Payment_method: 'Cash', Cus_id: null, Staff_id: null, Voucher_id: null, Shipping_Name: 'lll', Shipping_Phone: '0987654321', Shipping_Address: '1, abc, abcd, abcde' },
  ]

  const details = [
    { Detail_id: 1, Order_id: 1, Item_id: 2, Quantity: 1, Price: 29000 },
    { Detail_id: 2, Order_id: 1, Item_id: 4, Quantity: 1, Price: 45000 },
    { Detail_id: 3, Order_id: 2, Item_id: 2, Quantity: 1, Price: 29000 },
    { Detail_id: 4, Order_id: 2, Item_id: 3, Quantity: 1, Price: 32000 },
    { Detail_id: 5, Order_id: 2, Item_id: 14, Quantity: 1, Price: 39000 },
    { Detail_id: 6, Order_id: 3, Item_id: 6, Quantity: 1, Price: 39000 },
    { Detail_id: 7, Order_id: 3, Item_id: 7, Quantity: 1, Price: 42000 },
    { Detail_id: 8, Order_id: 3, Item_id: 8, Quantity: 1, Price: 35000 },
    { Detail_id: 9, Order_id: 3, Item_id: 15, Quantity: 2, Price: 42000 },
    { Detail_id: 11, Order_id: 5, Item_id: 4, Quantity: 2, Price: 45000 },
    { Detail_id: 12, Order_id: 5, Item_id: 15, Quantity: 2, Price: 42000 },
    { Detail_id: 13, Order_id: 6, Item_id: 12, Quantity: 1, Price: 30000 },
    { Detail_id: 14, Order_id: 6, Item_id: 9, Quantity: 1, Price: 49000 },
    { Detail_id: 15, Order_id: 7, Item_id: 20, Quantity: 1, Price: 55000 },
    { Detail_id: 16, Order_id: 7, Item_id: 17, Quantity: 1, Price: 40000 },
    { Detail_id: 17, Order_id: 8, Item_id: 2, Quantity: 1, Price: 29000 },
    { Detail_id: 18, Order_id: 8, Item_id: 3, Quantity: 1, Price: 32000 },
    { Detail_id: 20, Order_id: 10, Item_id: 2, Quantity: 1, Price: 29000 },
    { Detail_id: 21, Order_id: 10, Item_id: 15, Quantity: 1, Price: 42000 },
    { Detail_id: 22, Order_id: 11, Item_id: 4, Quantity: 1, Price: 45000 },
    { Detail_id: 23, Order_id: 11, Item_id: 16, Quantity: 1, Price: 75000 },
    { Detail_id: 26, Order_id: 13, Item_id: 15, Quantity: 1, Price: 42000 },
    { Detail_id: 27, Order_id: 13, Item_id: 13, Quantity: 1, Price: 45000 },
    { Detail_id: 28, Order_id: 14, Item_id: 3, Quantity: 1, Price: 32000 },
    { Detail_id: 29, Order_id: 15, Item_id: 3, Quantity: 1, Price: 32000 },
  ]

  const feedbacks = [
    { Feedback_id: 1, Cus_id: 4, Content: 'Đồ ngon', Rating: 5, Created_at: '2025-12-11 10:28:39', Image: 'images/gallery-6.jpg', Dish_name: 'Cappuccino' },
    { Feedback_id: 2, Cus_id: 4, Content: 'ngon', Rating: 5, Created_at: '2025-12-11 11:32:47', Image: null, Dish_name: 'Matcha' },
    { Feedback_id: 3, Cus_id: 4, Content: 'cũng ngon', Rating: 4, Created_at: '2025-12-11 12:00:52', Image: '/images/1765429252198-bg_2.jpg', Dish_name: 'Cafe sữa' },
    { Feedback_id: 4, Cus_id: 3, Content: 'like it', Rating: 5, Created_at: '2025-12-11 12:02:25', Image: '/images/1765429345586-drink-1.jpg', Dish_name: 'Juice' },
  ]

  return { accounts, categories, customers, items, vouchers, orders, details, feedbacks }
}
