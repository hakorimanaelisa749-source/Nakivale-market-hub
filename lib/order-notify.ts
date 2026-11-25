// Instant Order Alert - Buyer -> Seller
import { supabase } from './supabase'

// A. Buyer creates order - call this when buyer taps "Order"
export async function createOrder(sellerId: string, buyerId: string, productId: string, productName: string, quantity: number) {
  const { data, error } = await supabase.from('orders').insert({
    seller_id: sellerId,
    buyer_id: buyerId,
    product_id: productId,
    product_name: productName,
    quantity: quantity,
    status: 'pending',
    created_at: new Date().toISOString()
  }).select().single()

  if (!error && data) {
    // Also log for Worker Robot if needed
    // Check if seller is online - if not, send WhatsApp fallback
    const isOnline = await checkSellerOnline(sellerId)
    if (!isOnline) {
      await sendSellerWhatsApp(sellerId, productName, quantity)
    }
  }
  return data
}

// B. Seller listens - put this in Seller Dashboard page
export function listenForOrders(sellerId: string, onNewOrder: (order: any) => void) {
  const channel = supabase
    .channel(`orders-${sellerId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: `seller_id=eq.${sellerId}`
    }, (payload) => {
      // INSTANT - fires in <1 sec
      onNewOrder(payload.new)
      // Play sound + show popup
      new Audio('/order-sound.mp3').play().catch(() => {})
      if (Notification.permission === 'granted') {
        new Notification('New Order!', { body: `${payload.new.product_name} x${payload.new.quantity}` })
      }
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}

// C. Seller Online Status - call when seller opens app
export async function setSellerOnline(sellerId: string, online: boolean) {
  await supabase.from('seller_presence').upsert({
    seller_id: sellerId,
    is_online: online,
    last_seen: new Date().toISOString()
  })
}

async function checkSellerOnline(sellerId: string) {
  const { data } = await supabase
    .from('seller_presence')
    .select('is_online, last_seen')
    .eq('seller_id', sellerId)
    .single()
  if (!data) return false
  // Online if active in last 2 minutes
  const lastSeen = new Date(data.last_seen).getTime()
  return data.is_online && (Date.now() - lastSeen < 2 * 60 * 1000)
}

async function sendSellerWhatsApp(sellerId: string, productName: string, quantity: number) {
  // Get seller phone from profiles, then send via WhatsApp API
  const { data: seller } = await supabase.from('profiles').select('phone').eq('id', sellerId).single()
  if (!seller?.phone) return

  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: seller.phone,
      type: 'text',
      text: { body: `🔔 New Order! ${productName} x${quantity} - Open Nakivale Market Hub to accept it.` }
    })
  })
}
