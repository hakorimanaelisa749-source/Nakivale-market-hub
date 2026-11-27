"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess("Account created! Welcome to VELA.");
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <button onClick={() => router.back()} style={{ border: "none", background: "none", fontSize: 22 }}>←</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 20 }}>Create Account</h1>
      <p style={{ color: "#666" }}>Join VELA Shop - Nakivale's online market</p>

      {error && <div style={{ background: "#ffe5e5", color: "#c00", padding: 12, borderRadius: 10, marginTop: 15 }}>{error}</div>}
      {success && <div style={{ background: "#e5ffe5", color: "#0a7a0a", padding: 12, borderRadius: 10, marginTop: 15 }}>{success}</div>}

      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: 14, borderRadius: 12, border: "1px solid #ddd" }} />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: 14, borderRadius: 12, border: "1px solid #ddd" }} />
        <input placeholder="Phone e.g. 078..." value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid #ddd" }} />
        <button disabled={loading} style={{ background: "#ff6b00", color: "#fff", padding: 16, borderRadius: 12, border: "none", fontWeight: 700, fontSize: 16 }}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
