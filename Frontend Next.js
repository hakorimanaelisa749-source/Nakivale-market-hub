// components/ProductCard.tsx
export default function ProductCard({ p, onView, onAdd }: any) {
  const isChristmas = (p.category === 'Christmas' || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('dress') || p.name.toLowerCase().includes('shoe'));
  return (
    <div className="card">
      {isChristmas && <><span className="christmasTag">🎄 CHRISTMAS</span><span className="saleTag">-30%</span></>}
      <img src={p.img} onClick={() => onView(p)} alt={p.name} />
      <div className="card-body">
        <div className="card-title">{p.name}</div>
        <div className="card-price">{Number(p.price).toLocaleString()} UGX</div>
        <div className="card-shop">{p.shop}</div>
        <div className="card-actions">
          <button className="btn-view" onClick={() => onView(p)}>View</button>
          <button className="btn-cart" onClick={() => onAdd(p)}>Add</button>
        </div>
      </div>
    </div>
  );
}
