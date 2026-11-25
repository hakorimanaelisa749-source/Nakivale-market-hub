export function OrderPopup({ order, onClose }: any) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 999 }}>
      <h3>🔔 New Order!</h3>
      <p><b>{order.product_name}</b> x {order.quantity}</p>
      <p>Status: {order.status}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={async () => { await respondToOrder(order.id, 'accepted'); onClose() }} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8 }}>
          ✅ Accept
        </button>
        <button onClick={async () => { await respondToOrder(order.id, 'rejected'); onClose() }} style={{ background: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8 }}>
          ❌ Reject
        </button>
      </div>
    </div>
  )
}
