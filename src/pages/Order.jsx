import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { useApp } from "../context/AppContext";
import { loadDB } from "../utils/db";
import { currency } from "../utils/format";

export default function OrderPage() {
  const { state, dispatch } = useApp();
  const db = loadDB();
  const [cart, setCart] = useState([]);
  const [promo, setPromo] = useState("");
  const [note, setNote] = useState("");

  const add = (m) =>
    setCart((c) => {
      const i = c.findIndex((x) => x.id === m.id);
      if (i >= 0) {
        const cc = [...c];
        cc[i].qty++;
        return cc;
      }
      return [...c, { id: m.id, name: m.name, price: m.price, qty: 1 }];
    });

  const dec = (id) =>
    setCart((c) =>
      c
        .map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty - 1) } : x))
        .filter((x) => x.qty > 0)
    );

  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const matched = db.promotions.find(
    (p) => p.code.toUpperCase() === promo.toUpperCase() && p.active
  );
  const discount = matched
    ? matched.type === "percent"
      ? Math.round((subtotal * matched.value) / 100)
      : Math.min(subtotal, matched.value)
    : 0;
  const payable = Math.max(0, subtotal - discount);

  const canPlace = cart.length > 0 && state.user;

  const placeOrder = () => {
    if (!canPlace) return;
    const order = {
      id: uuid(),
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      userId: state.user.id,
      items: cart.map(({ id, qty, price }) => ({ menuId: id, qty, price })),
      total: subtotal,
      discount,
      payable,
      promoCode: matched?.code || null,
      status: "CREATED",
      note,
      createdAt: Date.now(),
    };
    dispatch({ type: "ORDER_CREATE", order });
    setCart([]);
    setPromo("");
    setNote("");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="font-semibold text-lg mb-3">Chọn món</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {db.menu.map((m) => (
            <button key={m.id} onClick={() => add(m)} className="text-left card">
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-neutral-500">{m.category}</div>
              <div className="mt-1 font-bold">{currency(m.price)}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Giỏ hàng</h2>
        <div className="card space-y-3">
          {cart.length === 0 && (
            <div className="text-sm text-neutral-500">Chưa có món</div>
          )}
          {cart.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-neutral-500">
                  {currency(i.price)} × {i.qty}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost" onClick={() => dec(i.id)}>
                  -
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => { const item = db.menu.find(m => m.id === i.id); if (item) add(item); }}
                >
                  +
                </button>
                <button
                  className="btn bg-red-600 text-white"
                  onClick={() => remove(i.id)}
                >
                  x
                </button>
              </div>
            </div>
          ))}
          <hr className="border-neutral-200 dark:border-neutral-800" />
          <input
            placeholder="Mã ưu đãi"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white dark:bg-neutral-900"
          />
          <p className="text-xs text-neutral-500">{matched ? matched.desc : ""}</p>
          <textarea
            placeholder="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white dark:bg-neutral-900"
          />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <b>{currency(subtotal)}</b>
            </div>
            <div className="flex justify-between">
              <span>Ưu đãi</span>
              <b>-{currency(discount)}</b>
            </div>
            <div className="flex justify-between text-lg">
              <span>Thanh toán</span>
              <b>{currency(payable)}</b>
            </div>
          </div>
          <button
            disabled={!canPlace}
            onClick={placeOrder}
            className={`w-full btn ${
              canPlace ? "btn-primary" : "bg-neutral-300 text-neutral-500"
            }`}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
