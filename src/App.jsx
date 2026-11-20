import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import Toast from './components/Toast.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotFound from './components/NotFound.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MenuPage from './pages/Menu.jsx'
import OrderPage from './pages/Order.jsx'
import HistoryPage from './pages/History.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import Account from './pages/Account.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminMenu from './pages/admin/Menu.jsx'
import AdminPromos from './pages/admin/Promos.jsx'
import AdminFeedback from './pages/admin/Feedback.jsx'
import AdminCustomers from './pages/admin/Customers.jsx'

const admin = (el) => <ProtectedRoute role="admin">{el}</ProtectedRoute>
const authed = (el) => <ProtectedRoute>{el}</ProtectedRoute>

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/history" element={authed(<HistoryPage />)} />
        <Route path="/account" element={authed(<Account />)} />
        <Route path="/orders/:id" element={authed(<OrderDetail />)} />
        <Route path="/admin/orders" element={admin(<AdminOrders />)} />
        <Route path="/admin/menu" element={admin(<AdminMenu />)} />
        <Route path="/admin/promos" element={admin(<AdminPromos />)} />
        <Route path="/admin/feedback" element={admin(<AdminFeedback />)} />
        <Route path="/admin/customers" element={admin(<AdminCustomers />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </AppShell>
  )
}
