import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import Login from './pages/Login'
import MenuPage from './pages/Menu'
import OrderPage from './pages/Order'
import HistoryPage from './pages/History'
import AdminOrders from './pages/admin/Orders'
import AdminMenu from './pages/admin/Menu'
import AdminPromos from './pages/admin/Promos'
import AdminFeedback from './pages/admin/Feedback'
import AdminOnly from './components/AdminOnly'


export default function App() {
    return (
        <AppShell>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/admin/orders" element={<AdminOnly><AdminOrders /></AdminOnly>} />
        <Route path="/admin/menu" element={<AdminOnly><AdminMenu /></AdminOnly>} />
        <Route path="/admin/promos" element={<AdminOnly><AdminPromos /></AdminOnly>} />
        <Route path="/admin/feedback" element={<AdminOnly><AdminFeedback /></AdminOnly>} />
        </Routes>
        </AppShell>
    )
}