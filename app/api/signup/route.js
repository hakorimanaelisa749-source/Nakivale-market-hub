import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const { full_name, email, phone } = await req.json()

    if (!full_name || !email || !phone) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
    )

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'This email already has an account. Please login.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name, email: email.toLowerCase(), phone }])
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, user: data })
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
