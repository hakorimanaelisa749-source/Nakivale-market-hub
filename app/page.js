import CartDrawer from "./components/CartDrawer";

export default function Home() {
  const [cart, setCart] = useState([]); // your cart state

  return (
    <div>
      {/* Your header + products here */}
      <CartDrawer cart={cart} cartCount={cart.length} />

      {/* Products - NO cart div here anymore! */}
      {/* When user clicks "Add to Cart", just do setCart([...cart, product]) */}
    </div>
  );
}
