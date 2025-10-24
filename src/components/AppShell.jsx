import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { loadDB } from "../utils/db";

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);
  return (
    <button className="btn btn-ghost" title="Toggle theme" onClick={() => setDark((d) => !d)}>
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

export default function AppShell({ children }) {
  const { state, dispatch } = useApp();
  const db = loadDB();
  const points = db.loyalty[state.user?.id] || 0;

  const linkCls = ({ isActive }) =>
    `px-3 py-1 rounded-full text-sm ${
      isActive
        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container py-3 flex items-center gap-3">
          <Link to="/" className="font-black tracking-wider text-xl">☕ CoffeeManager</Link>
          <nav className="ml-auto hidden sm:flex gap-2">
            <NavLink to="/menu" className={linkCls}>Menu</NavLink>
            <NavLink to="/order" className={linkCls}>Tạo đơn</NavLink>
            <NavLink to="/history" className={linkCls}>Lịch sử</NavLink>
            {state.user?.role === "admin" && (
              <>
                <NavLink to="/admin/orders" className={linkCls}>QL đơn</NavLink>
                <NavLink to="/admin/menu" className={linkCls}>QL menu</NavLink>
                <NavLink to="/admin/promos" className={linkCls}>Ưu đãi</NavLink>
                <NavLink to="/admin/feedback" className={linkCls}>Phản hồi</NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {state.user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-sm">
                  {state.user.name} · {state.user.role === "admin" ? "Admin" : "KH"} · {points}điểm
                </span>
                <button className="btn btn-primary" onClick={() => dispatch({ type: "LOGOUT" })}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6">{children}</main>

    </div>
  );
}
