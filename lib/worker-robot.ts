// Worker Robot - Fixed: Email + Product Names + Customers
import { supabase } from './supabase'

// 1. LOG - call this when worker does something
export async function logWorkerWork(
  workerId: string,
  action: 'approve' | 'reject' | 'support_reply' | 'ticket_closed' | 'sale',
  details?: { productName?: string, customerName?: string, amount?: number }
) {
  await supabase.from('worker_activity').insert({
    worker_id: workerId,
    action: action,
    product_name: details?.productName || null,
    customer_name: details?.customerName || null,
    amount: details?.amount || null,
    created_at: new Date().toISOString()
  })
}

// 2. BUILD REPORT - grouped by EMAIL
export async function getWorkerReport() {
  const today = new Date().toISOString().slice(0, 10)
  
  // Get activity + worker email in one go
  const { data } = await supabase
    .from('worker_activity')
    .select(`*, workers(email)`)
    .gte('created_at', today)

  const report: any = {}
  data?.forEach((log: any) => {
    const email = log.workers?.email || log.worker_id
    if (!report[email]) {
      report[email] = { approved: [], rejected: 0, replies: 0, closed: 0, sales: [], totalSales: 0 }
    }
    if (log.action === 'approve') report[email].approved.push(log.product_name)
    if (log.action === 'reject') report[email].rejected++
    if (log.action === 'support_reply') report[email].replies++
    if (log.action === 'ticket_closed') report[email].closed++
    if (log.action === 'sale') {
      report[email].sales.push(`${log.customer_name} - ${log.amount} RWF`)
      report[email].totalSales += log.amount || 0
    }
  })
  return report
}

// 3. SEND TO YOU ON WHATSAPP AT 6PM
export async function sendWhatsAppReport() {
  const report = await getWorkerReport()
  
  let message = `*📊 VELA REPORT - Today 6PM*\n\n`
  for (const email in report) {
    const r = report[email]
    message += `*👤 ${email}*\n`
    message += `✅ Legal Products Approved: ${r.approved.length}\n`
    if (r.approved.length > 0) message += `  - ${r.approved.join(', ')}\n`
    message += `💬 Support Replies: ${r.replies} | Closed: ${r.closed}\n`
    message += `🛒 Customers Sold: ${r.sales.length} | Total: ${r.totalSales} RWF\n`
    if (r.sales.length > 0) message += `  - ${r.sales.join('\n  - ')}\n`
    message += `\n`
  }
  if (Object.keys(report).length === 0) message += `No worker activity today.`

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
}
