import { createClient } from '@supabase/supabase-js'

export const config = { schedule: "0 15 * * *" }
// 0 15 UTC = 18:00 / 6PM Kampala time (UTC+3)
// Don't put 18, or it will send at 9PM

export default async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('worker_activity')
    .select(`*, workers(email)`)
    .gte('created_at', today)

  const report = {}
  data?.forEach((log) => {
    const email = log.workers?.email || log.worker_id
    if (!report[email]) report[email] = { approved: [], replies: 0, closed: 0, sales: [], totalSales: 0 }
    if (log.action === 'approve') report[email].approved.push(log.product_name)
    if (log.action === 'support_reply') report[email].replies++
    if (log.action === 'ticket_closed') report[email].closed++
    if (log.action === 'sale') {
      report[email].sales.push(`${log.customer_name} - ${log.amount} RWF`)
      report[email].totalSales += log.amount || 0
    }
  })

  let message = `*📊 VELA REPORT - Today 6PM*\n\n`
  for (const email in report) {
    const r = report[email]
    message += `*👤 ${email}*\n✅ Approved: ${r.approved.length} - ${r.approved.join(', ')}\n💬 Replies: ${r.replies} | Closed: ${r.closed}\n🛒 Customers: ${r.sales.length} | Total: ${r.totalSales} RWF\n\n`
  }
  if (Object.keys(report).length === 0) message += `No worker activity today.`

  // Send WhatsApp
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: process.env.ADMIN_PHONE,
      type: 'text',
      text: { body: message }
    })
  })

  return new Response('Report sent')
}
