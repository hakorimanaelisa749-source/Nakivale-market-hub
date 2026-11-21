export default function ProductCard({ product }: { product: any }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '12px', background: 'white' }}>
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
      ) : null}
      <h3 style={{ margin: '10px 0 4px' }}>{product.name || 'Product'}</h3>
      <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>{product.description || ''}</p>
      <p style={{ fontWeight: 'bold', margin: 0 }}>
        {product.price ? `${product.price} UGX` : 'Price on request'}
      </p>
    </div>
  )
}
