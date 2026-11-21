'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const MOMO_CODE = "47852783";
const CATEGORIES = ['All', 'Christmas', 'Fashion', 'Phones & Tablets', 'Electronics', 'Home & Office', 'Supermarket'];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>(() => JSON.parse(localStorage.getItem('vela_cart') || '[]'));
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');

  // Load products from Python Backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`).then(r => r.json()).then(d => setProducts(d.products || []));
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => { localStorage.setItem('vela_cart', JSON.stringify(cart)); }, [cart]);

  const isChristmas = (p: any) => p.category === 'Christmas' || ['christmas','jacket','dress','shoe'].some(w => (p.name||'').toLowerCase().includes(w));
  const filtered = products.filter(p => {
    const catOk = activeCat === 'All' ? true : activeCat === 'Christmas' ? isChristmas(p) : p.category === activeCat;
    const qOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.shop||'').toLowerCase().includes(search.toLowerCase());
    return catOk && qOk;
  });

  // Auth Step 1 -> 2 -> 3
  async function authFinish() {
    if (password.length < 6) return alert('Password must be 6+');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return alert(signUpError.message);
    }
    setAuthStep(3);
  }

  async function checkout() {
    const phone = (document.getElementById('buyerPhone') as HTMLInputElement).value;
    const zone = (document.getElementById('buyerZone') as HTMLSelectElement).value;
    const details = (document.getElementById('buyerDetails') as HTMLInputElement).value;
    if (!phone || !zone || !details) return alert('Fill phone, zone, house');
    if (!confirm(`Pay ${cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()} UGX to VELA ${MOMO_CODE}?`)) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ cart, buyer_id: user.id, buyer_email: user.email, buyer_phone: phone, buyer_zone: zone, buyer_details: details }) });
    setCart([]); alert(`✅ Order Created! Pay to VELA ${MOMO_CODE}`);
  }

  return (
    <div>
      <header><button onClick={()=>{}}>☰</button><h1>VELA<span>.</span></h1><div>🛒 {cart.reduce((s,i)=>s+i.qty,0)} <button onClick={()=> setShowLogin(true)}>👤</button></div></header>
      <div className="catRow">{CATEGORIES.map(c => <button key={c} className={`catBtn ${activeCat===c?'active':''} ${c==='Christmas'?'sale':''}`} onClick={()=>setActiveCat(c)}>{c==='Christmas'?'🎄 Black Friday':c}</button>)}</div>
      {(activeCat==='All'||activeCat==='Christmas') && <div className="bfBanner"><h2>CHRISTMAS CLOTHES <span>UP TO 30% OFF</span></h2><p>Jackets, Dresses, Shoes for Nakivale, Kampala, Mbarara. Pay to VELA 47852783 only.</p><button onClick={()=>setActiveCat('Christmas')}>Shop Christmas Now →</button></div>}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products in Nakivale..." className="inp" style={{margin:12}} />
      <div className="grid">{filtered.map(p => <ProductCard key={p.id} p={p} onView={setViewProduct} onAdd={(prod:any)=>{ const ex=cart.find(i=>i.id===prod.id); if(ex) setCart(cart.map(i=>i.id===prod.id?{...i,qty:i.qty+1}:i)); else setCart([...cart,{...prod,qty:1}]); }} />)}</div>

      {/* Cart + Checkout - same as your old pageCart */}
      <div className="box"><h2>🛒 My Cart</h2>{cart.map(i=><div key={i.id}>{i.name} - {i.price} UGX x {i.qty}</div>)}<button className="submit" onClick={checkout}>🔒 Place Order - Pay to VELA First</button><input id="buyerPhone" className="inp" placeholder="Your Phone 078..." /><select id="buyerZone" className="inp"><option>Nakivale Base Camp</option><option>Kampala</option><option>Mbarara</option></select><input id="buyerDetails" className="inp" placeholder="House description" /></div>

      {/* Login Modal - 3 steps, same as before */}
      {showLogin && <div className="modal-bg open"><div className="modal"><button className="closeX" onClick={()=>setShowLogin(false)}>✕</button>{authStep===1 && <><h3>Welcome to VELA 👋</h3><input className="inp" placeholder="Your Email" value={email} onChange={e=>setEmail(e.target.value)} /><button className="submit" onClick={()=> email.includes('@') ? setAuthStep(2) : alert('Enter valid email')}>Next →</button></>}{authStep===2 && <><h3>Create Password 🔒</h3><input className="inp" type="password" placeholder="Password 6+" value={password} onChange={e=>setPassword(e.target.value)} /><button className="submit" onClick={authFinish}>Create Account / Sign In</button></>}{authStep===3 && <><h3>✅ You are in!</h3><button className="submit" onClick={()=>setShowLogin(false)}>Go Shopping →</button></>}</div></div>}

      {/* Product View */}
      {viewProduct && <div id="productViewBg" className="open"><img src={viewProduct.img} className="pv-img" /><div className="pv-body"><button className="closeX" onClick={()=>setViewProduct(null)}>✕</button><div style={{fontWeight:900}}>{viewProduct.name}</div><div>{Number(viewProduct.price).toLocaleString()} UGX</div><button className="pv-btn buy" onClick={()=>{ setCart([...cart,{...viewProduct,qty:1}]); setViewProduct(null); }}>💳 Buy Now</button><button className="pv-btn call" onClick={()=>window.open(`https://wa.me/${viewProduct.shop_wa}`)}>💬 Chat Seller</button></div></div>}

      <footer>VELA Uganda<br/>Pay Only To 47852783 - Name: VELA<br/>Nakivale • Kampala • Mbarara</footer>
    </div>
  );
}
