-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 11, 2025 lúc 01:28 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `my_coffee_shop`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `account`
--

CREATE TABLE `account` (
  `Acc_id` int(11) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Full_name` varchar(100) NOT NULL,
  `Role` enum('Admin','Customer') DEFAULT 'Customer',
  `Join_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `account`
--

INSERT INTO `account` (`Acc_id`, `Email`, `Username`, `Password`, `Full_name`, `Role`, `Join_date`) VALUES
(1, 'admin@antt.com', 'admin', 'admin123', 'Quản Trị Viên', 'Admin', '2025-12-10 15:46:01'),
(2, 'user@antt.com', 'user', '123456', 'Ú Ẻ', 'Customer', '2025-12-10 15:46:01'),
(3, 'a@a.com', 'aaa', '123456', 'aaaaa', 'Customer', '2025-12-10 15:48:07'),
(5, 'c@c.com', 'ccc', '123456', 'ccccc', 'Customer', '2025-12-11 08:45:00'),
(6, 'b@b.com', 'bbb', '123456', 'bbbbb', 'Customer', '2025-12-11 09:20:12');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

CREATE TABLE `category` (
  `Cate_id` int(11) NOT NULL,
  `Cate_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `category`
--

INSERT INTO `category` (`Cate_id`, `Cate_name`) VALUES
(4, 'Bánh'),
(1, 'Cà phê'),
(3, 'Món ăn'),
(2, 'Trà');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer`
--

CREATE TABLE `customer` (
  `Cus_id` int(11) NOT NULL,
  `F_name` varchar(20) NOT NULL,
  `L_name` varchar(40) NOT NULL,
  `Phone` varchar(10) NOT NULL,
  `Points` int(11) DEFAULT 0,
  `Acc_id` int(11) DEFAULT NULL,
  `Level` varchar(20) GENERATED ALWAYS AS (case when `Points` < 200 then 'Bronze' when `Points` >= 200 and `Points` < 500 then 'Silver' when `Points` >= 500 and `Points` < 1000 then 'Gold' else 'Diamond' end) STORED,
  `Address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `customer`
--

INSERT INTO `customer` (`Cus_id`, `F_name`, `L_name`, `Phone`, `Points`, `Acc_id`, `Address`) VALUES
(3, '', 'ccccc', '0123456789', 600, 5, NULL),
(4, 'Ú', 'Ẻ', '0234567891', 0, 2, NULL),
(5, '', 'bbbbb', '0111222333', 0, 6, '1, abc, phường ABC, thành phố abcd, tỉnh ABCD');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `detail`
--

CREATE TABLE `detail` (
  `Detail_id` int(11) NOT NULL,
  `Order_id` int(11) NOT NULL,
  `Item_id` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT 1,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `detail`
--

INSERT INTO `detail` (`Detail_id`, `Order_id`, `Item_id`, `Quantity`, `Price`) VALUES
(1, 1, 2, 1, 29000.00),
(2, 1, 4, 1, 45000.00),
(3, 2, 2, 1, 29000.00),
(4, 2, 3, 1, 32000.00),
(5, 2, 14, 1, 39000.00),
(6, 3, 6, 1, 39000.00),
(7, 3, 7, 1, 42000.00),
(8, 3, 8, 1, 35000.00),
(9, 3, 15, 2, 42000.00),
(11, 5, 4, 2, 45000.00),
(12, 5, 15, 2, 42000.00),
(13, 6, 12, 1, 30000.00),
(14, 6, 9, 1, 49000.00),
(15, 7, 20, 1, 55000.00),
(16, 7, 17, 1, 40000.00),
(17, 8, 2, 1, 29000.00),
(18, 8, 3, 1, 32000.00),
(20, 10, 2, 1, 29000.00),
(21, 10, 15, 1, 42000.00),
(22, 11, 4, 1, 45000.00),
(23, 11, 16, 1, 75000.00),
(26, 13, 15, 1, 42000.00),
(27, 13, 13, 1, 45000.00),
(28, 14, 3, 1, 32000.00),
(29, 15, 3, 1, 32000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `feedback`
--

CREATE TABLE `feedback` (
  `Feedback_id` int(11) NOT NULL,
  `Cus_id` int(11) NOT NULL,
  `Content` text DEFAULT NULL,
  `Rating` int(11) DEFAULT 5,
  `Created_at` datetime DEFAULT current_timestamp(),
  `Image` varchar(255) DEFAULT NULL,
  `Dish_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `feedback`
--

INSERT INTO `feedback` (`Feedback_id`, `Cus_id`, `Content`, `Rating`, `Created_at`, `Image`, `Dish_name`) VALUES
(1, 4, 'Đồ ngon', 5, '2025-12-11 10:28:39', 'gallery-6.jpg', 'Cappucino'),
(2, 4, 'ngon', 5, '2025-12-11 11:32:47', NULL, 'Matcha'),
(3, 4, 'cũng ngon', 4, '2025-12-11 12:00:52', '/images/1765429252198-bg_2.jpg', 'Cafe sữa'),
(4, 3, 'like it', 5, '2025-12-11 12:02:25', '/images/1765429345586-drink-1.jpg', 'Juice');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item`
--

CREATE TABLE `item` (
  `Item_id` int(11) NOT NULL,
  `Item_name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Image` varchar(255) DEFAULT NULL,
  `Is_active` bit(1) DEFAULT b'1',
  `Cate_id` int(11) NOT NULL,
  `Price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item`
--

INSERT INTO `item` (`Item_id`, `Item_name`, `Description`, `Image`, `Is_active`, `Cate_id`, `Price`) VALUES
(1, 'Cà phê Đen Đá', 'Hương vị cà phê Robusta đậm đà, đánh thức mọi giác quan', 'images/menu-1.jpg', b'1', 1, 25000.00),
(2, 'Cà phê Sữa Đá', 'Sự hòa quyện tuyệt vời giữa vị đắng cà phê và vị ngọt của sữa', 'images/menu-2.jpg', b'1', 1, 29000.00),
(3, 'Bạc Xỉu', 'Nhiều sữa, ít cà phê, béo ngậy và thơm lừng', 'images/coffee-1.jpg', b'1', 1, 32000.00),
(4, 'Cappuccino', 'Cà phê Ý đẳng cấp với lớp bọt sữa bồng bềnh', 'images/coffee-2.jpeg', b'1', 1, 45000.00),
(5, 'Trà Đào Cam Sả', 'Thức uống thanh mát, giải nhiệt với đào miếng giòn tan', 'images/menu-3.jpg', b'1', 2, 39000.00),
(6, 'Trà Vải Hoa Hồng', 'Hương thơm hoa hồng tinh tế kết hợp vải thiều mọng nước', 'images/drink-1.jpg', b'1', 2, 39000.00),
(7, 'Trà Sen Vàng', 'Vị trà Oolong đậm đà kết hợp hạt sen bùi bùi và kem béo', 'images/drink-2.jpg', b'1', 2, 42000.00),
(8, 'Nước Ép Cam', 'Cam tươi nguyên chất, bổ sung Vitamin C', 'images/drink-3.jpg', b'1', 2, 35000.00),
(9, 'Matcha Đá Xay', 'Bột Matcha Nhật Bản xay nhuyễn cùng sữa tươi và kem whipping', 'images/drink-4.jpg', b'1', 3, 49000.00),
(10, 'Chocolate Cookie', 'Đá xay sô cô la đậm vị kết hợp vụn bánh quy giòn tan', 'images/drink-5.jpg', b'1', 3, 52000.00),
(11, 'Caramel Freeze', 'Vị caramel ngọt ngào quyện cùng cà phê đá xay mát lạnh', 'images/drink-6.jpg', b'1', 3, 49000.00),
(12, 'Bánh Croissant', 'Bánh sừng trâu ngàn lớp, vỏ giòn ruột mềm thơm mùi bơ', 'images/dessert-1.jpg', b'1', 4, 30000.00),
(13, 'Tiramisu', 'Bánh ngọt tráng miệng vị cà phê và ca cao nổi tiếng của Ý', 'images/dessert-2.jpg', b'1', 4, 45000.00),
(14, 'Mousse Chanh Dây', 'Vị chua ngọt nhẹ nhàng, cốt bánh mềm tan trong miệng', 'images/dessert-3.jpg', b'1', 4, 39000.00),
(15, 'Cheesecake Dâu', 'Bánh phô mai béo ngậy kết hợp sốt dâu tây tươi', 'images/dessert-4.jpg', b'1', 4, 42000.00),
(16, 'Gà nướng nguyên con', 'gà nướng thơm ngon, suất ăn cho cả gia đình', '/images/1765416601733-dish-4.jpg', b'1', 3, 75000.00),
(17, 'Bánh Mì Kẹp Thịt', 'Bánh mì giòn tan kẹp thịt nướng đậm đà', '/images/1765417904688-burger-1.jpg', b'1', 3, 40000.00),
(18, 'Salad Trộn', 'Rau củ tươi ngon trộn cùng sốt đặc biệt', '/images/1765417925960-dish-7.jpg', b'1', 3, 35000.00),
(20, 'Thịt sườn nướng', 'Thịt sườn nướng thơm phức', '/images/1765417974398-dish-2.jpg', b'1', 3, 55000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order`
--

CREATE TABLE `order` (
  `Order_id` int(11) NOT NULL,
  `Order_date` datetime DEFAULT current_timestamp(),
  `Init_amount` decimal(12,2) DEFAULT 0.00,
  `Discount_amount` decimal(12,2) DEFAULT 0.00,
  `Total_amount` decimal(12,2) DEFAULT 0.00,
  `Status` varchar(20) DEFAULT 'Pending',
  `Payment_method` varchar(20) DEFAULT 'Cash',
  `Cus_id` int(11) DEFAULT NULL,
  `Staff_id` int(11) DEFAULT NULL,
  `Voucher_id` int(11) DEFAULT NULL,
  `Shipping_Name` varchar(100) DEFAULT NULL,
  `Shipping_Phone` varchar(20) DEFAULT NULL,
  `Shipping_Address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order`
--

INSERT INTO `order` (`Order_id`, `Order_date`, `Init_amount`, `Discount_amount`, `Total_amount`, `Status`, `Payment_method`, `Cus_id`, `Staff_id`, `Voucher_id`, `Shipping_Name`, `Shipping_Phone`, `Shipping_Address`) VALUES
(1, '2025-12-10 16:18:06', 0.00, 0.00, 64000.00, 'Processing', 'Cash', 2, NULL, NULL, NULL, NULL, NULL),
(2, '2025-12-10 16:29:47', 0.00, 0.00, 90000.00, 'Completed', 'Cash', 2, NULL, NULL, NULL, NULL, NULL),
(3, '2025-12-11 06:24:18', 0.00, 0.00, 190000.00, 'Cancelled', 'Cash', 3, NULL, NULL, NULL, NULL, NULL),
(5, '2025-12-11 08:48:27', 0.00, 0.00, 174000.00, 'CREATED', 'Cash', 5, NULL, NULL, NULL, NULL, NULL),
(6, '2025-12-11 08:48:47', 0.00, 0.00, 78950.00, 'Completed', 'Cash', 5, NULL, NULL, NULL, NULL, NULL),
(7, '2025-12-11 09:22:35', 0.00, 0.00, 94950.00, 'CREATED', 'Cash', 6, NULL, NULL, NULL, NULL, NULL),
(8, '2025-12-11 09:31:36', 0.00, 0.00, 45750.00, 'CREATED', 'Cash', 2, NULL, NULL, NULL, NULL, NULL),
(10, '2025-12-11 10:18:16', 0.00, 0.00, 53250.00, 'CREATED', 'Cash', 2, NULL, NULL, NULL, NULL, NULL),
(11, '2025-12-11 11:04:08', 0.00, 0.00, 110000.00, 'Completed', 'Cash', 2, NULL, NULL, NULL, NULL, NULL),
(13, '2025-12-11 14:06:54', 0.00, 0.00, 43500.00, 'CREATED', 'Cash', 6, NULL, NULL, 'bbbbb', '0111222333', '1, abc, abcd, abcde'),
(14, '2025-12-11 14:19:05', 0.00, 0.00, 32000.00, 'CREATED', 'Cash', NULL, NULL, NULL, 'ttt', '0222333444', '1, abc, abcd, abcde'),
(15, '2025-12-11 14:31:41', 0.00, 0.00, 32000.00, 'CREATED', 'Cash', NULL, NULL, NULL, 'lll', '0987654321', '1, abc, abcd, abcde');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `staff`
--

CREATE TABLE `staff` (
  `Staff_id` int(11) NOT NULL,
  `F_name` varchar(20) NOT NULL,
  `L_name` varchar(40) NOT NULL,
  `Acc_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

CREATE TABLE `voucher` (
  `Voucher_id` int(11) NOT NULL,
  `Voucher_name` varchar(100) NOT NULL,
  `Voucher_code` varchar(20) NOT NULL,
  `Description` text DEFAULT NULL,
  `Value` decimal(10,2) NOT NULL,
  `Min_order_val` decimal(10,2) DEFAULT 0.00,
  `Quantity` int(11) DEFAULT 0,
  `Max_usage_per_user` int(11) DEFAULT 1,
  `Date_start` datetime NOT NULL,
  `Date_end` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `voucher`
--

INSERT INTO `voucher` (`Voucher_id`, `Voucher_name`, `Voucher_code`, `Description`, `Value`, `Min_order_val`, `Quantity`, `Max_usage_per_user`, `Date_start`, `Date_end`) VALUES
(1, 'Demo Voucher', 'TEST10', 'Type: amount', 10000.00, 50000.00, 100, 1, '2025-12-10 15:46:01', '2026-01-09 15:46:01'),
(2, 'Mã XMAS10K', 'XMAS10K', 'percent', 50.00, 50000.00, -1, 1, '0000-00-00 00:00:00', '2026-01-09 21:09:23'),
(3, 'Mã NEW50', 'NEW50', 'amount', 20000.00, 40000.00, 0, 1, '0000-00-00 00:00:00', '2026-01-10 08:53:21'),
(4, 'Mã TEST%', 'TEST%', 'percent', 25.00, 30000.00, 0, 1, '0000-00-00 00:00:00', '2026-01-10 09:23:27'),
(5, 'Mã WEEKEND15K', 'WEEKEND15K', 'amount', 15000.00, 40000.00, 0, 1, '0000-00-00 00:00:00', '2026-01-10 11:31:44');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`Acc_id`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- Chỉ mục cho bảng `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`Cate_id`),
  ADD UNIQUE KEY `Cate_name` (`Cate_name`);

--
-- Chỉ mục cho bảng `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`Cus_id`),
  ADD UNIQUE KEY `Phone` (`Phone`),
  ADD UNIQUE KEY `Acc_id` (`Acc_id`);

--
-- Chỉ mục cho bảng `detail`
--
ALTER TABLE `detail`
  ADD PRIMARY KEY (`Detail_id`),
  ADD KEY `FK_Detail_Order` (`Order_id`),
  ADD KEY `FK_Detail_Item` (`Item_id`);

--
-- Chỉ mục cho bảng `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`Feedback_id`),
  ADD KEY `Cus_id` (`Cus_id`);

--
-- Chỉ mục cho bảng `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`Item_id`),
  ADD KEY `CK_Cate_id` (`Cate_id`);

--
-- Chỉ mục cho bảng `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`Order_id`),
  ADD KEY `FK_Order_Voucher` (`Voucher_id`);

--
-- Chỉ mục cho bảng `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`Staff_id`),
  ADD UNIQUE KEY `Acc_id` (`Acc_id`);

--
-- Chỉ mục cho bảng `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`Voucher_id`),
  ADD UNIQUE KEY `Voucher_code` (`Voucher_code`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `account`
--
ALTER TABLE `account`
  MODIFY `Acc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `category`
--
ALTER TABLE `category`
  MODIFY `Cate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `customer`
--
ALTER TABLE `customer`
  MODIFY `Cus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `detail`
--
ALTER TABLE `detail`
  MODIFY `Detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT cho bảng `feedback`
--
ALTER TABLE `feedback`
  MODIFY `Feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `item`
--
ALTER TABLE `item`
  MODIFY `Item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `order`
--
ALTER TABLE `order`
  MODIFY `Order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `staff`
--
ALTER TABLE `staff`
  MODIFY `Staff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `voucher`
--
ALTER TABLE `voucher`
  MODIFY `Voucher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `FK_Cus_Account` FOREIGN KEY (`Acc_id`) REFERENCES `account` (`Acc_id`);

--
-- Các ràng buộc cho bảng `detail`
--
ALTER TABLE `detail`
  ADD CONSTRAINT `FK_Detail_Item` FOREIGN KEY (`Item_id`) REFERENCES `item` (`Item_id`),
  ADD CONSTRAINT `FK_Detail_Order` FOREIGN KEY (`Order_id`) REFERENCES `order` (`Order_id`);

--
-- Các ràng buộc cho bảng `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`Cus_id`) REFERENCES `customer` (`Cus_id`);

--
-- Các ràng buộc cho bảng `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `CK_Cate_id` FOREIGN KEY (`Cate_id`) REFERENCES `category` (`Cate_id`);

--
-- Các ràng buộc cho bảng `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `FK_Order_Voucher` FOREIGN KEY (`Voucher_id`) REFERENCES `voucher` (`Voucher_id`);

--
-- Các ràng buộc cho bảng `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `FK_Staff_Account` FOREIGN KEY (`Acc_id`) REFERENCES `account` (`Acc_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
