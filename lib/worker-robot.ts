// Worker Robot - Auto tracks + Sends WhatsApp Report
import { supabase } from './supabase'

// 1. Auto log - workers do NOT fill anything
export async function logWorkerWork(
  workerId: string,
  action: 'approve' | 'reject' | 'support_reply' | 'ticket_closed',
  itemId?: string
) {
  await supabase.from('worker_activity').insert({
    worker_id: workerId,
    action: action,
    item_id: itemId,
    created_at: new Date().toISOString()
  })
}

// 2. Robot builds daily report
export async function getWorkerReport() {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('worker_activity')
    .select('*')
    .gte('created_at', today)

  const report: any = {}
  data?.forEach((log: any) => {
    if (!report[log.worker_id]) {
      report[log.worker_id] = { approved: 0, rejected: 0, replies: 0, closed: 0 }
    }
    if (log.action === 'approve') report[log.worker_id].approved++
    if (log.action === 'reject') report[log.worker_id].rejected++
    if (log.action === 'support_reply') report[log.worker_id].replies++
    if (log.action === 'ticket_closed') report[log.worker_id].closed++
  })
  return report
}

// 3. Robot sends report to YOU on WhatsApp
export async function sendWhatsAppReport() {
  const report = await getWorkerReport()
  
  let message = `*Workers Report - Today*\n\n`
  for (const workerId in report) {
    const r = report[workerId]
    const status = r.approved + r.replies > 5 ? '✅ Active' : '⚠️ Low Activity'
    message += `*Worker:* ${workerId.slice(0,8)}\nApproved: ${r.approved} | Rejected: ${r.rejected}\nSupport Replies: ${r.replies} | Tickets Closed: ${r.closed}\n${status}\n\n`
  }
  if (Object.keys(report).length === 0) {
    message += `No worker activity today.`
  }

  // Send via WhatsApp Cloud API
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: process.env.ADMIN_PHONE, // your number e.g. 256700000000
      type: 'text',
      text: { body: message }
    })
  })
}
