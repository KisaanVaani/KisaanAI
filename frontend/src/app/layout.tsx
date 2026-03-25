import type { Metadata } from 'next'
import { Playfair_Display, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  display: 'swap',
})

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KisanVaani - AI-Powered Voice Advisory for Indian Farmers',
  description: 'Call 896 from any basic phone and get instant AI-powered crop advisory in your language. Powered by Mistral AI and Sarvam STT/TTS.',
  keywords: ['agriculture', 'AI', 'farmers', 'India', 'voice assistant', 'crop advisory'],
  authors: [{ name: 'KisanVaani Team' }],
  openGraph: {
    title: 'KisanVaani - Your Farm\'s AI Advisor',
    description: 'AI-powered voice advisory available on any phone. No smartphone needed.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KisanVaani - AI for Every Farm',
    description: 'Call 896 and get expert crop advice in seconds',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${ibmPlex.variable}`}>
      <body className="font-sans antialiased bg-cream text-charcoal">
        {children}
      </body>
    </html>
  )
}
