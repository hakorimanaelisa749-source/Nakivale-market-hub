"use client";
import { useState } from "react";

const BACKEND = "https://vela-shop-online.onrender.com";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);

  async function handleSignup(e) {
    e.preventDefault();
    const res = await fetch(`${BACKEND}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User", email, phone: "078...", password: "1234" }),
    });
    const data = await res.json();
    if (res.ok) setStep(2);
    else alert(data.error);
  }

  async function handleVerify(e) {
    e.preventDefault();
    const res = await fetch(`${BACKEND}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  }

  return (
    <div style={{ padding: 20 }}>
      {step === 1 ? (
        <form onSubmit={handleSignup}>
          <h2>Create VELA Account</h2>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button>Send Code</button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <h2>Enter Code sent to {email}</h2>
          <input placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} required />
          <button>Verify & Login</button>
        </form>
      )}
    </div>
  );
}
