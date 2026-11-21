import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Nakivale Market Hub',
  description: 'Website for Nakivale traders to sell products',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
