import './globals.css'
import React from 'react'

export const metadata = {
  title: 'VELA - Nakivale Market Hub | Buy Safe With MoMo Escrow',
  description: 'VELA Uganda marketplace in Nakivale, Kampala, Mbarara. Buy Jordan, phones, TV, mosquito nets with MoMo Escrow. Safe delivery. VELA Nakivale Market Hub.',
  metadataBase: new URL('https://vela-shop-online.netlify.app'),
  alternates: {
    canonical: 'https://vela-shop-online.netlify.app/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
