import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@fontsource-variable/plus-jakarta-sans'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: 'AOS | AOteSoft', template: '%s | AOS' },
  description: 'Desarrollo de software a medida y automatización de procesos e informes para empresas en Colombia.',
  keywords: ['software a medida', 'desarrollo web', 'e-commerce', 'consultoria tecnologica', 'AOteSoft', 'Colombia'],
  authors: [{ name: 'AOteSoft' }],
  icons: {
    icon: '/images/favicon3.png',
    apple: '/images/favicon3.png',
  },
  openGraph: {
    title: 'AOS - Tecnología en la que puedes confiar',
    description: 'Software a medida y automatización de procesos para tu empresa.',
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
