import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'AOS - Tecnologia en la que puedes confiar | AOteSoft',
  description: 'Transformamos ideas en soluciones tecnologicas solidas. Desarrollo de software a medida, e-commerce, consultoria tecnologica y mantenimiento profesional.',
  keywords: ['software a medida', 'desarrollo web', 'e-commerce', 'consultoria tecnologica', 'AOteSoft', 'Colombia'],
  authors: [{ name: 'AOteSoft' }],
  icons: {
    icon: '/images/aoslogoo.png',
    apple: '/images/aoslogoo.png',
  },
  openGraph: {
    title: 'AOS - Tecnologia en la que puedes confiar',
    description: 'Transformamos ideas en soluciones tecnologicas solidas.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
