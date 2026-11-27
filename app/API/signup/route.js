export async function POST(req) {
  try {
    const { email, full_name, phone } = await req.json();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(`${url}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ email, full_name, phone })
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ error: "This email already has an account" }, { status: 400 });

    return Response.json({ success: true, user: data[0] });
  } catch (e) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
