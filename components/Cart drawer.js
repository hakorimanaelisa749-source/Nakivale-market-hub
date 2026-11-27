"use client";
import { useState } from "react";

export default function CartDrawer({ cart, cartCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Nakivale Base Camp");
  const [house, setHouse] = useState("");

  return (
    <>
      {/* CART BUTTON IN HEADER */}
      <button onClick={() => setIsOpen(true)} className="cart-btn">
        🛒 <span>{cartCount}</span>
      </button>

      {/* OVERLAY - dark background */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      {/* CART DRAWER - only shows when isOpen = true */}
      <div className={`cart-panel ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>🛒 My Cart</h3>
          <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <p style={{ textAlign: "center", padding: 20 }}>Cart is empty</p>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="cart-item">
                <span>{item.name}</span>
                <b>{item.price} UGX</b>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your Phone 078..." />
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option>Nakivale Base Camp</option>
            <option>Kampala</option>
            <option>Mbarara</option>
          </select>
          <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="House description" />
          <button className="order-btn">🔒 Place Order - Pay to VELA First</button>
          <p className="vela-pay">Pay Only To 47852783 - Name: VELA</p>
        </div>
      </div>

      <style jsx>{`
        .cart-btn {
          background: #FF6B00; color: white; border: none;
          padding: 10px 14px; border-radius: 20px;
          font-weight: bold; cursor: pointer;
        }
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 9998;
        }
        .cart-panel {
          position: fixed; top: 0; right: -100%;
          width: 90%; max-width: 380px; height: 100%;
          background: #fff; z-index: 9999;
          transition: right 0.3s ease;
          display: flex; flex-direction: column;
          box-shadow: -5px 0 20px rgba(0,0,0,0.2);
          border-radius: 20px 0 0 20px;
        }
        .cart-panel.open { right: 0; }
        .cart-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px; background: #FF6B00; color: white;
          border-radius: 20px 0 0 0;
        }
        .close-btn {
          background: white; border: none; width: 32px; height: 32px;
          border-radius: 50%; cursor: pointer;
        }
        .cart-body { flex: 1; overflow-y: auto; padding: 16px; }
        .cart-item {
          display: flex; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid #eee;
        }
        .cart-footer { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .cart-footer input, .cart-footer select {
          padding: 12px; border: 1px solid #eee; border-radius: 10px; width: 100%;
        }
        .order-btn {
          background: #FF6B00; color: white; border: none;
          padding: 15px; border-radius: 12px; font-weight: bold;
        }
        .vela-pay { text-align: center; font-size: 12px; color: #666; }
      `}</style>
    </>
  );
}
