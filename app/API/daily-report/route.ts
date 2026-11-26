import { sendWhatsAppReport } from '@/lib/worker-robot'

export async function GET() {
  try {
    await sendWhatsAppReport()
    return Response.json({ success: true, message: 'Report sent to WhatsApp' })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
